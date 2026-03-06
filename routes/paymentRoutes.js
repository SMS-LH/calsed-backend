const express = require('express');
const router = express.Router();
const { declareManualPayment, getHistory, initiatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Sécurité

// 1. Déclarer un paiement (Wave/Orange Money manuel)
// Route : POST /api/payment/declare
router.post('/declare', protect, declareManualPayment);

// 2. Voir l'historique des paiements d'un utilisateur
// Route : GET /api/payment/history/:userId
router.get('/history/:userId', protect, getHistory);

// 3. Initier un paiement en ligne (Futur)
// Route : POST /api/payment/initiate
router.post('/initiate', protect, initiatePayment);

module.exports = router;