const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  company: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['Emploi', 'Stage', 'Alternance', 'Freelance'], 
    required: true 
  },
  location: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true 
  },
  link: { 
    type: String, 
    default: '', 
    trim: true 
  },
  contactEmail: { 
    type: String, 
    default: '', 
    trim: true, 
    lowercase: true // Standardisation email
  },

  // Référence technique
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Champ de confort pour le frontend (gardé tel quel)
  authorId: { type: String } 
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);