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

    // Cloudinary renvoie l'URL complète dans req.file.path
    const imageUrl = req.file.path; 
    
    // On renvoie cette URL au Frontend
    res.status(200).send(imageUrl); 
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'upload cloud" });
  }
});

module.exports = router;