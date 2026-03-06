const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    trim: true 
  }, 
  amount: { type: Number, required: true },
  months: { type: Number, required: true },
  type: { 
    type: String, 
    default: 'Wave', 
    trim: true 
  },
  reference: { 
    type: String, 
    default: '', 
    trim: true 
  },
  status: { 
    type: String, 
    default: 'pending', 
    trim: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);