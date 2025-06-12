const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  }
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode; 