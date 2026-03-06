const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken"); // On utilise ton utilitaire
const { sendResetPasswordEmail, sendAdminNotification } = require("../utils/mailer");

// --- 1. INSCRIPTION ---
exports.register = async (req, res) => {
  const { name, email, password, generation, phone } = req.body;

  try {
    // Vérification existence
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Création de l'utilisateur
    const user = new User({
      name,
      email,
      password, // Sera hashé par le middleware ou ci-dessous
      generation,
      phone,
      role: 'member',
      isValidated: false
    });

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Notification aux admins
    try {
        await sendAdminNotification(user);
    } catch (err) {
        console.error("⚠️ Erreur envoi mail admin:", err.message);
    }

    res.status(201).json({ 
        success: true,
        message: "Inscription réussie ! Votre compte est en attente de validation par le bureau national.",
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            isValidated: user.isValidated 
        } 
    });

  } catch (err) {
    console.error("Erreur Inscription:", err.message);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

// --- 2. CONNEXION ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Sécurité : Message générique pour ne pas aider les pirates
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // VÉRIFICATION DU STATUT
    if (!user.isValidated) {
      return res.status(403).json({ 
        message: "Votre compte est en attente de validation par l'administration." 
      });
    }

    // Vérification mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Réponse avec Token généré proprement
    res.json({ 
        token: generateToken(user._id), 
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            paidUntil: user.paidUntil,
            avatar: user.avatar
        } 
    });

  } catch (err) {
    console.error("Erreur Login:", err.message);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

// --- 3. MOT DE PASSE OUBLIÉ ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Aucun compte trouvé avec cet email." });
    }

    // Génération du token de réinitialisation
    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

    // On sauvegarde sans valider les autres champs (pour éviter les erreurs bloquantes)
    await user.save({ validateBeforeSave: false });

    try {
        await sendResetPasswordEmail(user.email, token);
        res.json({ success: true, message: "Email de réinitialisation envoyé." });
    } catch (emailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: "L'email n'a pas pu être envoyé." });
    }

  } catch (error) {
    console.error("Erreur Forgot Password:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- 4. RÉINITIALISATION DU MOT DE PASSE ---
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Le lien est invalide ou a expiré." });
    }

    // Nouveau hashage
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Nettoyage des tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Mot de passe modifié avec succès." });

  } catch (error) {
    console.error("Erreur Reset Password:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};