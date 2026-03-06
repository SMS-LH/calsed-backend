const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: "home_config", 
    unique: true 
  },
  data: {
    heroTitle: { type: String, default: '', trim: true },
    heroSubtitle: { type: String, default: '', trim: true },
    heroImage: { type: String, default: '' },
    philoTitle: { type: String, default: '', trim: true },
    philoText: { type: String, default: '', trim: true },
    philImage1: { type: String, default: '' },
    philImage2: { type: String, default: '' },
    servicesTitle: { type: String, default: '', trim: true },
    servicesBadge: { type: String, default: '', trim: true },
    ctaTitle: { type: String, default: '', trim: true }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Settings', settingsSchema);