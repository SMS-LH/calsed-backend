const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// 1. On configure Multer avec une limite stricte de 5 Mo
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo en octets
});

// 2. On intercepte intelligemment la requête pour gérer les erreurs Multer
router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    // Si l'erreur vient de Multer (ex: fichier trop lourd)
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "L'image est trop lourde (maximum 5 Mo)." });
      }
      return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
    } else if (err) {
      // Autre erreur inattendue
      console.error("Erreur inconnue upload:", err);
      return res.status(500).json({ message: "Erreur lors du transfert de l'image." });
    }

    // --- Si tout s'est bien passé, on traite le fichier ---
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu." });
      }

      // Cloudinary renvoie l'URL complète (https://res...) dans req.file.path
      const imageUrl = req.file.path; 
      
      // On renvoie cette URL intacte au Frontend
      res.status(200).send(imageUrl); 
    } catch (processErr) {
      console.error("Erreur détaillée de l'upload Cloudinary:", processErr);
      res.status(500).json({ message: "Erreur lors de l'upload vers le cloud." });
    }
  });
});

module.exports = router;