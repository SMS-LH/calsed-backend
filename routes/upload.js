const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    // Cloudinary renvoie l'URL complète (https://res...) dans req.file.path
    const imageUrl = req.file.path; 
    
    // On renvoie cette URL intacte au Frontend
    res.status(200).send(imageUrl); 
  } catch (err) {
    // SÉCURITÉ : Affiche l'erreur exacte dans le terminal Render pour faciliter ton débogage
    console.error("Erreur détaillée de l'upload Cloudinary:", err);
    res.status(500).json({ message: "Erreur lors de l'upload vers le cloud" });
  }
});

module.exports = router;