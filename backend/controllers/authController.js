const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const VerificationCode = require('../models/VerificationCode');
const sendVerificationCode = require('../utils/emailService');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem email już istnieje' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Błąd podczas rejestracji:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Użytkownik o podanym adresie email nie istnieje' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe hasło' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Błąd podczas logowania:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe hasło' });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Ten adres email jest już używany' });
      }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji konta:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowe hasło' });
    }

    user.password = newPassword;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Błąd podczas zmiany hasła:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Konto zostało pomyślnie usunięte' });
  } catch (error) {
    console.error('Błąd podczas usuwania konta:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    const lastCode = await VerificationCode.findOne({ email });
    if (lastCode) {
      const timeSinceLastSent = Date.now() - lastCode.lastSentAt.getTime();
      if (timeSinceLastSent < 60000) {
        return res.status(429).json({ 
          message: 'Poczekaj minutę przed ponownym wysłaniem kodu',
          timeLeft: Math.ceil((60000 - timeSinceLastSent) / 1000)
        });
      }
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await VerificationCode.findOneAndUpdate(
      { email },
      { 
        email,
        code,
        lastSentAt: new Date()
      },
      { upsert: true } // jesli nie ma dokumentu, tworzy sie nowy
    );

    const emailSent = await sendVerificationCode(email, code);
    if (!emailSent) {
      return res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania kodu' });
    }

    res.status(200).json({ message: 'Kod weryfikacyjny został wysłany' });
  } catch (error) {
    console.error('Błąd w sendVerificationCode:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania kodu' });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.code !== code) {
      return res.status(400).json({ message: 'Nieprawidłowy kod weryfikacyjny' });
    }

    res.status(200).json({ message: 'Kod weryfikacyjny jest prawidłowy' });
  } catch (error) {
    console.error('Błąd w verifyCode:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji kodu' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.code !== code) {
      return res.status(400).json({ message: 'Nieprawidłowy lub wygasły kod weryfikacyjny' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    user.password = newPassword;
    await user.save();

    await VerificationCode.deleteOne({ email });

    res.status(200).json({ message: 'Hasło zostało zmienione' });
  } catch (error) {
    console.error('Błąd w resetPassword:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas resetowania hasła' });
  }
};