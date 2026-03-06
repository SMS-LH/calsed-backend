const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Import du middleware sécurisé

// Route: POST /api/upload
// Description: Upload une seule image et renvoie son chemin
router.post('/', upload.single('image'), (req, res) => {
  try {
    // Normalisation du chemin (remplace les backslashes Windows \ par des slashs /)
    const filePath = `/${req.file.path.replace(/\\/g, "/")}`;
    
    res.send(filePath);
  } catch (err) {
    res.status(400).send({ message: "Erreur lors de l'upload de l'image" });
  }
});

module.exports = router;