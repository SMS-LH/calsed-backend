const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: [String], 
    default: [] 
  },
  category: { 
    type: String, 
    default: "Général", 
    trim: true 
  },
  stock: { 
    type: Number, 
    default: 0 
  },
  description: { 
    type: String, 
    default: "", 
    trim: true 
  }
}, {
  timestamps: true // Gère createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Product', productSchema);