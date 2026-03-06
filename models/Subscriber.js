const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, "L'email est requis"], 
    unique: true, 
    trim: true,
    lowercase: true,
    // Validation simple pour vérifier le format a@b.c
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
      'Veuillez fournir une adresse email valide'
    ]
  },
  subscribedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);