const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true // Supprime les espaces inutiles au début/fin
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true // Force l'email en minuscule pour éviter les doublons (Ex: User@mail.com vs user@mail.com)
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['member', 'admin', 'visitor'], 
    default: 'visitor' 
  },
  generation: { type: String, default: 'N/A' },
  avatar: { type: String, default: '' },
  
  // GESTION COTISATION
  paidUntil: { type: Date, default: null },
  
  // VALIDATION DU BUREAU
  isValidated: { type: Boolean, default: false }, 

  // SÉCURITÉ : MOT DE PASSE OUBLIÉ
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // CHAMPS PROFIL
  headline: { type: String, default: '', trim: true },
  location: { type: String, default: '', trim: true },
  bio: { type: String, default: '', trim: true },
  
  // STRUCTURES DE TABLEAUX
  experiences: [
    {
      company: { type: String, trim: true },
      position: { type: String, trim: true },
      period: { type: String, trim: true }
    }
  ],

  education: [
    {
      school: { type: String, trim: true },
      degree: { type: String, trim: true },
      year: { type: String, trim: true }
    }
  ],

  // RÉSUMÉ
  company: { type: String, default: '', trim: true },
  university: { type: String, default: '', trim: true },

  // CONTACT & RÉSEAUX
  phone: { type: String, default: '', trim: true },
  website: { type: String, default: '', trim: true },
  linkedin: { type: String, default: '', trim: true },
  github: { type: String, default: '', trim: true }

}, {
  timestamps: true // Remplace createdAt manuel et ajoute updatedAt automatiquement
});

module.exports = mongoose.model('User', userSchema);