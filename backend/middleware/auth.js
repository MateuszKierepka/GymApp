const jwt = require('jsonwebtoken');
const config = require('../config/config');

// autoryzacja uzytkownika
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacji' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

module.exports = auth;