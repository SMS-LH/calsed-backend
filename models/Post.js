const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true // Nettoyage des espaces
  },
  excerpt: { 
    type: String, 
    trim: true 
  },
  content: { 
    type: String, 
    trim: true 
  },
  image: { type: String, default: '' },
  category: { 
    type: String, 
    default: 'Actualité', 
    trim: true 
  },
  
  // Gestion "À la une"
  featured: { type: Boolean, default: false },
  
  // INTERACTIONS
  likes: { 
    type: [String], 
    default: [] 
  },

  comments: [
    {
      author: { type: String, required: true, trim: true },
      authorId: { type: String, required: true },
      content: { type: String, required: true, trim: true },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true // Remplace le champ 'date' manuel et ajoute 'updatedAt'
});

module.exports = mongoose.model('Post', postSchema);