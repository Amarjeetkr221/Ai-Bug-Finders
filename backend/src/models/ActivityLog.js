const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be system or guest actions
  },
  action: {
    type: String,
    required: true // e.g. 'User Login', 'Code Analyzed', 'Account Promoted'
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
