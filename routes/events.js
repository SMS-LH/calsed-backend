const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User'); // <-- AJOUT : On a besoin du modèle User pour trouver les membres
const { protect, admin } = require('../middleware/authMiddleware');
const { sendNewEventAlert } = require('../utils/mailer'); // <-- AJOUT : Import de la fonction d'email (Ajuste le chemin si ton fichier s'appelle autrement)

// 1. Lire tous les événements (Public)
router.get('/', async (req, res) => {
  try {
    // Tri par date : du plus proche au plus lointain
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Créer un événement (Admin seulement)
router.post('/', protect, admin, async (req, res) => {
  try {
    const newEvent = new Event({
        ...req.body,
        createdBy: req.user.id
    });
    const savedEvent = await newEvent.save();

    // --- NOUVEAU : ENVOI DES INVITATIONS AUX MEMBRES ---
    // On l'enveloppe dans un bloc try/catch séparé pour être sûr que 
    // même si le mail échoue, l'événement est bien créé.
    try {
      // On cherche uniquement les membres validés (isApproved: true)
      // On récupère juste l'email, le prénom et le nom pour alléger la mémoire
      const members = await User.find({ isApproved: true }, 'email prenom nom name');
      
      if (members.length > 0) {
        // On n'utilise PAS de 'await' ici intentionnellement !
        // Ça permet de répondre au Frontend immédiatement pendant que le serveur gère les envois en fond.
        sendNewEventAlert(members, savedEvent)
          .then(() => console.log(`✅ Invitations envoyées à ${members.length} membres.`))
          .catch(err => console.error('❌ Erreur envoi invitations événement:', err));
      }
    } catch (mailError) {
      console.error("Erreur lors de la récupération des membres :", mailError);
    }
    // ---------------------------------------------------

    // On répond au Frontend que c'est un succès immédiat
    res.status(201).json(savedEvent);
  } catch (err) {
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