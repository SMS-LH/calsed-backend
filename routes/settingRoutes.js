const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'home_config' });
    
    if (!settings) {
        // On crée un document avec les valeurs par défaut du modèle
        settings = await Settings.create({ key: 'home_config' });
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur chargement configuration" });
  }
});

// @route   PUT /api/settings
router.put('/', protect, admin, async (req, res) => {
  try {
    // Correction : On passe directement req.body pour matcher la structure du modèle
    const settings = await Settings.findOneAndUpdate(
      { key: 'home_config' },
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur sauvegarde configuration" });
  }
});

module.exports = router;