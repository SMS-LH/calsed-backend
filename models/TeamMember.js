const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Le nom est obligatoire"] 
  },
  role: { 
    type: String, 
    required: [true, "Le rôle est obligatoire"] 
  },
  generation: { 
    type: String, 
    default: "" 
  },
  image: { 
    type: String, 
    default: "" // Contiendra l'URL Cloudinary (https://res.cloudinary.com/...)
  },
  linkedin: { 
    type: String, 
    default: "" 
  },
  email: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);