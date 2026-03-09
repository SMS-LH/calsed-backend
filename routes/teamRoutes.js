const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/team
router.get('/', async (req, res) => {
  try {
    // On trie par date de création pour que le bureau soit organisé
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des membres" });
  }
});

// @route   POST /api/team
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, role, image, linkedin, email, generation } = req.body;

    // Vérification minimale côté serveur
    if (!name || !role) {
      return res.status(400).json({ message: "Le nom et le rôle sont obligatoires" });
    }

    const newMember = new TeamMember({
      name,
      role,
      image, 
      linkedin,
      email,
      generation
    });

    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    console.error("Erreur création membre:", err);
    res.status(400).json({ message: "Données invalides ou manquantes" });
  }
});

// @route   DELETE /api/team/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: "Membre non trouvé" });
    }

    res.json({ message: "Membre supprimé avec succès" });
  } catch (err) {
    // Gestion spécifique si l'ID envoyé est mal formaté (CastError)
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: "ID de membre invalide" });
    }
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

module.exports = router;