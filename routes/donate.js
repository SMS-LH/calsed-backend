const express = require('express');
const router = express.Router();

// Route simple pour vérifier que le module fonctionne
router.get('/', (req, res) => {
  res.send("Module de dons opérationnel (Intégration PayTech à venir)");
});

module.exports = router;