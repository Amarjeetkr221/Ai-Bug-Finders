const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    default: 'AI Bug Detector'
  },
  logo: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'dark'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  geminiApiKey: {
    type: String,
    default: ''
  },
  openaiApiKey: {
    type: String,
    default: ''
  },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFrom: { type: String, default: '' },
  cloudinaryCloudName: { type: String, default: '' },
  cloudinaryApiKey: { type: String, default: '' },
  cloudinaryApiSecret: { type: String, default: '' },
  googleClientId: { type: String, default: '' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  seoDescription: {
    type: String,
    default: 'Detect, analyze, explain, and fix code bugs using state-of-the-art AI.'
  },
  seoKeywords: {
    type: String,
    default: 'AI, bug finder, code analysis, SaaS, developer tools'
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
