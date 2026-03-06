const express = require('express');
const router = express.Router();
const { getOffers, createOffer, deleteOffer } = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getOffers);
router.post('/', protect, createOffer); // Tout membre connecté peut poster une offre
router.delete('/:id', protect, deleteOffer); // L'auteur ou l'admin peut supprimer

module.exports = router;