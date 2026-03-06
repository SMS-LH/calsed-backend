const express = require("express");
const router = express.Router();

// On importe le contrôleur qu'on vient de créer/vérifier
const authController = require("../controllers/authController");

// --- DÉFINITION DES ROUTES ---

// Route pour l'inscription
// POST /api/auth/register
router.post("/register", authController.register);

// Route pour la connexion
// POST /api/auth/login
router.post("/login", authController.login);

// Route pour demander la réinitialisation (envoi de l'email)
// POST /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// Route pour définir le nouveau mot de passe (avec le token dans l'URL)
// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;