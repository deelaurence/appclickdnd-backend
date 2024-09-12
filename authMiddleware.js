const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'someSecretKey';

const authenticateToken = (req, res, next) => {
  // Get the token from the request headers (usually sent in the 'Authorization' header as "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Store the user data in request for future use
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { authenticateToken };
