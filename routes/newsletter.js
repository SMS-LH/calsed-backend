const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// S'abonner
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifie si déjà inscrit
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Cet email est déjà inscrit." });
    }

    const newSub = new Subscriber({ email });
    await newSub.save();

    res.status(201).json({ success: true, message: "Inscription réussie !" });
  } catch (err) {
    // Gestion erreur doublon (si la vérification ci-dessus échoue pour raison concurrence)
    if (err.code === 11000) {
        return res.status(400).json({ message: "Cet email est déjà inscrit." });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Se désabonner (Optionnel mais recommandé RGPD)
router.post('/unsubscribe', async (req, res) => {
    try {
        await Subscriber.findOneAndDelete({ email: req.body.email });
        res.json({ message: "Désabonnement pris en compte." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;