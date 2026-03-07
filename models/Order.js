const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Liaison optionnelle avec un compte utilisateur
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Facultatif pour permettre les achats "invités"
  },
  // Nom du client (utilisé pour l'affichage et les invités)
  customerName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  city: { 
    type: String, 
    default: "Dakar", 
    trim: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Changé productId en product pour plus de clarté Mongoose
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['En attente', 'Payé', 'Livré', 'Annulé'], 
    default: 'En attente' 
  },
  isDelivered: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);