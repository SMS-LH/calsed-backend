const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/settings
// @desc    Récupérer les paramètres du site (Public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'home_config' });
    
    if (!settings) {
        // Si la config n'existe pas encore, on la crée avec les valeurs par défaut
        settings = await Settings.create({ key: 'home_config' });
    }
    
    // On renvoie l'objet directement à la racine (pas de sous-objet 'data')
    res.json(settings);
  } catch (err) {
    console.error("Erreur GET Settings:", err);
    res.status(500).json({ message: "Erreur chargement configuration" });
  }
});

// @route   PUT /api/settings
// @desc    Mettre à jour les paramètres (Admin uniquement)
router.put('/', protect, admin, async (req, res) => {
  try {
    // SÉCURITÉ : On copie req.body et on supprime les champs système pour ne pas corrompre MongoDB
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
    console.error("Erreur PUT Settings:", err);
    res.status(500).json({ message: "Erreur sauvegarde configuration" });
  }
});

module.exports = router;