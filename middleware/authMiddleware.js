const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Protection de base (Vérifie si connecté)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // On récupère le token (après "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // On décrypte l'ID caché dans le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // On récupère l'utilisateur en base sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      next(); // C'est bon, on passe à la suite
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
  }
};

// 2. Protection Admin (Vérifie si rôle === admin)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : Réservé aux administrateurs' });
  }
};

module.exports = { protect, admin };