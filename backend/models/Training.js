const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    default: 0
  },
  reps: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: ''
  },
  sets: [setSchema]
}, {
  timestamps: true
});

const trainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [exerciseSchema]
}, {
  timestamps: true
});

trainingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training; 