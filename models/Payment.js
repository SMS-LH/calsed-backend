const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    trim: true 
  }, 
  amount: { 
    type: Number, 
    required: true 
  },
  months: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    default: 'Wave/OM (Déclaré)', // Mis à jour pour refléter notre nouvelle méthode
    trim: true 
  },
  reference: { 
    type: String, 
    default: '', 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], // Sécurité : Seules ces 3 valeurs sont autorisées
    default: 'pending', 
    trim: true 
  }
}, {
  timestamps: true // Génère automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Payment', PaymentSchema);