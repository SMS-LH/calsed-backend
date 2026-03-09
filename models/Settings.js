const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: "home_config", 
    unique: true 
  },
  // On simplifie la structure pour que ça corresponde exactement à ton Frontend
  heroImage: { type: String, default: '' },
  philImage1: { type: String, default: '' },
  philImage2: { type: String, default: '' },
  schoolImage: { type: String, default: '' }, // <-- AJOUTÉ pour la page Équipe
  
  // Tu peux garder les textes si tu comptes les rendre modifiables plus tard
  heroTitle: { type: String, default: '' },
  heroSubtitle: { type: String, default: '' },
  philoTitle: { type: String, default: '' },
  philoText: { type: String, default: '' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Settings', settingsSchema);