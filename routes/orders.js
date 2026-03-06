const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', createOrder); // Public (pas besoin d'être connecté pour acheter)
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders); // Dashboard Admin
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;