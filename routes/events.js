const express = require('express'); // 1. On importe express
const router = express.Router();    // 2. On initialise le router
const Event = require('../models/Event');
const User = require('../models/User'); 
const { protect, admin } = require('../middleware/authMiddleware');
const { sendNewEventAlert } = require('../utils/mailer');

// 1. Lire tous les événements (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Créer un événement (Admin seulement)
router.post('/', protect, admin, async (req, res) => {
  console.log("--- [START] Requête POST /events reçue ---");
  try {
    const newEvent = new Event({
        ...req.body,
        createdBy: req.user.id
    });
    
    const savedEvent = await newEvent.save();
    console.log("✅ Événement enregistré ID:", savedEvent._id);

    // Fonction d'envoi d'emails en arrière-plan
    const processEmails = async () => {
      try {
        const members = await User.find({ isApproved: true }, 'email prenom nom name');
        if (members.length > 0) {
          console.log(`📧 Envoi d'emails à ${members.length} membres...`);
          await sendNewEventAlert(members, savedEvent);
          console.log("✅ Emails envoyés.");
        }
      } catch (err) {
        console.error("❌ Erreur mailer :", err.message);
      }
    };

    processEmails(); // Lancement sans await pour ne pas bloquer la réponse

    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("❌ Erreur création événement :", err.message);
    res.status(400).json({ message: err.message });
  }
});

// 3. Supprimer un événement (Admin seulement)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; // 3. On exporte le router