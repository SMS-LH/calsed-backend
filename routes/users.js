const express = require('express');
const router = express.Router();
const User = require('../models/User');
// IMPORT SÉCURITÉ (Indispensable)
const { protect, admin } = require('../middleware/authMiddleware');
const { sendMemberStatusEmail, sendReminderEmail } = require('../utils/mailer');

// --- 1. RÉCUPÉRER TOUS LES MEMBRES (ADMIN SEULEMENT) ---
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password') 
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. RÉCUPÉRER UN MEMBRE SPÉCIFIQUE (PROTECT) ---
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Membre introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. MISE À JOUR DU PROFIL (PROTECT) ---
router.put('/profile', protect, async (req, res) => {
  try {
    // Sécurité : On s'assure que l'utilisateur ne modifie que SON profil (ou est admin)
    // (Sauf si c'est pour mettre à jour ses propres infos)
    let updateData = { ...req.body };
    const userIdToUpdate = updateData._id || updateData.id;

    // Si l'ID envoyé n'est pas celui du token et qu'on n'est pas admin => Erreur
    if (userIdToUpdate !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: "Non autorisé" });
    }
    
    // Nettoyage
    delete updateData._id;
    delete updateData.id;
    delete updateData.email; // On évite de changer l'email ici pour la sécurité
    delete updateData.password; // Jamais de mdp ici

    const updatedUser = await User.findByIdAndUpdate(
        userIdToUpdate, 
        { $set: updateData }, 
        { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 4. TÉLÉCHARGEMENT DE L'AVATAR (PROTECT) ---
router.post('/upload-avatar/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: req.body.avatar }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. VALIDER UN MEMBRE (ADMIN SEULEMENT) ---
router.put('/:id/validate', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isValidated: true }, 
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    try { await sendMemberStatusEmail(user.email, user.name, true); } 
    catch (e) { console.error(e); }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 6. GESTION COTISATIONS (ADMIN SEULEMENT) ---
router.put('/subscribe', protect, admin, async (req, res) => {
  const { userId, monthsPaid } = req.body;
  const months = parseInt(monthsPaid);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const now = new Date();
    let baseDate = (user.paidUntil && new Date(user.paidUntil) > now) 
        ? new Date(user.paidUntil) 
        : now;

    baseDate.setMonth(baseDate.getMonth() + months);
    baseDate.setHours(23, 59, 59, 999);
    user.paidUntil = baseDate;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 7. SUPPRIMER UN MEMBRE (ADMIN SEULEMENT) ---
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 8. RELANCE EMAIL (ADMIN SEULEMENT) ---
router.post('/:id/remind', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await sendReminderEmail(user.email, user.name);
    res.json({ message: "Relance envoyée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur mail" });
  }
});

module.exports = router;