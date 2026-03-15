const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: "home_config", 
    unique: true 
  },
  // --- IMAGES ---
  heroImage: { type: String, default: '' },
  philImage1: { type: String, default: '' },
  philImage2: { type: String, default: '' },
  schoolImage: { type: String, default: '' }, 
  
  // --- ANCIENS TEXTES (Conservés au cas où) ---
  heroTitle: { type: String, default: '' },
  heroSubtitle: { type: String, default: '' },
  philoTitle: { type: String, default: '' },
  philoText: { type: String, default: '' },

  // --- NOUVELLES STATISTIQUES ---
  stat1Number: { type: String, default: '2016' },
  stat1Label: { type: String, default: 'Année de création' },
  
  stat2Number: { type: String, default: '+500' },
  stat2Label: { type: String, default: 'Anciens élèves' },
  
  stat3Number: { type: String, default: '15' },
  stat3Label: { type: String, default: 'Pays de résidence' },
  
  stat4Number: { type: String, default: '100%' },
  stat4Label: { type: String, default: 'Engagement' }

}, { 
  timestamps: true 
});

module.exports = mongoose.model('Settings', settingsSchema);