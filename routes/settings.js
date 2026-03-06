const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');

// Lire les paramètres (Public)
router.get('/', async (req, res) => {
  try {
    // On cherche la config "home_config" ou on en crée une vide si inexistante
    let settings = await Settings.findOne({ key: 'home_config' });
    
    if (!settings) {
        settings = new Settings({ key: 'home_config', data: {} });
        await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur chargement configuration" });
  }
});

// Modifier les paramètres (Admin)
router.put('/', protect, admin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'home_config' },
      { $set: { data: req.body } },
      { new: true, upsert: true } // Crée si n'existe pas
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur sauvegarde configuration" });
  }
});

module.exports = router;