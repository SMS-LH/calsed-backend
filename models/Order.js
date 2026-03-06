const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number
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