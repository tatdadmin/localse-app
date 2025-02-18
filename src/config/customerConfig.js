require("dotenv").config();
module.exports = {
    jwtSecretCustomer: process.env.jwtSecretCustomer ,
    AllowedMaxDisBwCustNServiceProv: process.env.AllowedMaximumDistanceBetweenCustomerAndService,
    customerJWTExp:process.env.CUSTOMER_JWT_EXPIRY, // #IN MINUTES
    customerRefreshTokenExp: process.env.CUSTOMER_REFRESH_TOKEN_EXPIRY, //=10 //#InMinutes
    AllowedSearchServiceProviders:process.env.AllowedSearchServiceProviders
  };
  