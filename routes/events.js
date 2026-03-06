const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

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