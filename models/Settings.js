const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: "home_config", 
    unique: true 
  },
  // Structure simplifiée : correspond exactement aux états de ton Frontend
  heroImage: { type: String, default: '' },
  philImage1: { type: String, default: '' },
  philImage2: { type: String, default: '' },
  schoolImage: { type: String, default: '' }, // Utilisé pour la page Équipe
  
  // Textes (conservés pour de futures fonctionnalités)
  heroTitle: { type: String, default: '' },
  heroSubtitle: { type: String, default: '' },
  philoTitle: { type: String, default: '' },
  philoText: { type: String, default: '' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Settings', settingsSchema);