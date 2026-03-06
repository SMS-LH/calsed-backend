const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    trim: true 
  }, 
  type: { 
    type: String, 
    enum: ['AG', 'Rencontre', 'Webinaire', 'Autre'], 
    default: 'Rencontre' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true // Standardisation des dates de création
});

module.exports = mongoose.model('Event', EventSchema);