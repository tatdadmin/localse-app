const { verifyToken } = require('../services/authService');

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  const decoded = verifyToken(token.replace("Bearer ", ""));
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  req.user = decoded; // Attach decoded user info to the request object
  next(); // Proceed to the next middleware or route handler
};

module.exports = authenticate;
