const express = require('express');
const router = express.Router();
// On importe notre nouvelle fonction updateOffer
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getOffers);
router.post('/', protect, createOffer); // Tout membre connecté peut poster une offre

// --- NOUVEAU : La route pour modifier une offre ---
router.put('/:id', protect, updateOffer); 

router.delete('/:id', protect, deleteOffer); // L'auteur ou l'admin peut supprimer

module.exports = router;