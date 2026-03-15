const express = require('express');
const router = express.Router();
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

    // ---- PARTIE EMAILS (AVEC MOUCHARDS) ----
    const processEmails = async () => {
      console.log("🔍 ETAPE 1 : Lancement de la recherche des membres...");
      try {
        const members = await User.find({ isValidated: true }, 'email name');
        console.log(`📊 ETAPE 2 : J'ai trouvé ${members.length} membres validés dans la base de données.`);
        
        if (members.length > 0) {
          console.log("🚀 ETAPE 3 : J'envoie les emails maintenant...");
          await sendNewEventAlert(members, savedEvent);
          console.log("✅ ETAPE 4 : Tous les emails ont été envoyés !");
        } else {
          console.log("⚠️ ETAPE 3bis : Je n'envoie rien car il y a 0 membre validé.");
        }
      } catch (err) {
        console.error("❌ ERREUR FATALE PENDANT LES EMAILS :", err);
      }
    };

    // On déclenche la fonction des emails
    processEmails();
    // ----------------------------------------

    // On répond au site web que c'est bon
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

module.exports = router;