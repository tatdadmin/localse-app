const cron = require("node-cron");
const serviceProviderModel = require("../models/serviceProviderModel");
const ServiceProviderPanelLogins = require("../models/ServiceProviderPanelLogins");
require("dotenv").config();


const cronInterval = process.env.CRON_TIME || 10; 
const logoutTimeInMinutes = process.env.AUTOMATIC_PANEL_LOGOUT_TIME || 60; // Default: 480 minutes (8 hours)

const runServiceProviderCron = () => {
    cron.schedule(`*/${cronInterval} * * * *`, async () => {  
    try {

      const currentTimeAgo = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      currentTimeAgo.setMinutes(currentTimeAgo.getMinutes() - logoutTimeInMinutes);
      const expiredProviders = await serviceProviderModel.find({
        panel_login: "1",
        last_panel_login: { $lt: currentTimeAgo },
      });

      if (expiredProviders.length === 0) return;

      for (let provider of expiredProviders) {
        await serviceProviderModel.updateOne(
          { _id: provider._id },
          { $set: { panel_login: "0" } }
        );

        const serviceProviderPanelLoginData = await ServiceProviderPanelLogins.findOne({
          service_provider_mobile_number: provider.service_provider_mobile_number,
          active_status: 1,
        });

        if (serviceProviderPanelLoginData) {
          serviceProviderPanelLoginData.active_status = 0;
          await serviceProviderPanelLoginData.save();
        }
        }
    } catch (error) {
      console.error("Error in cron job:", error.message);
    }
  });
};

module.exports = runServiceProviderCron;
