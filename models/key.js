const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  key: String,
  type: { type: String, enum: ['normal', 'better', 'premium'] },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

module.exports = mongoose.model('Key', keySchema);
