const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'home_config' });
    if (!settings) {
        settings = await Settings.create({ key: 'home_config' });
    }
    // On renvoie l'objet directement
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur chargement configuration" });
  }
});

// @route   PUT /api/settings
router.put('/', protect, admin, async (req, res) => {
  try {
    // Supprimer les champs système pour ne pas écraser MongoDB par erreur
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.key;

    const settings = await Settings.findOneAndUpdate(
      { key: 'home_config' },
      { $set: updateData }, 
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Erreur sauvegarde" });
  }
});

module.exports = router;