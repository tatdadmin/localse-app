const jwt = require('jsonwebtoken');
const { jwtSecretCustomer } = require('../config/customerConfig');

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the Authorization header (Bearer <token>)

  if (!token) {
    return res.status(403).json({ message: 'Token is required for authentication' });
  }

  // Verify the JWT token
  jwt.verify(token, jwtSecretCustomer, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user.data; // Attach user data to the request object for further use
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateJWT;
