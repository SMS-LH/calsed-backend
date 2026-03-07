const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrderStatus 
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROUTES ---

// 1. Créer une commande : Accessible à TOUS (Membres et Invités)
// Note: On ne met pas 'protect' ici pour permettre l'achat public
router.post('/', createOrder); 

// 2. Historique personnel : Uniquement pour les membres connectés
router.get('/myorders', protect, getMyOrders);

// 3. Gestion globale : Uniquement pour l'administrateur
router.get('/', protect, admin, getAllOrders); 

// 4. Mise à jour statut : Uniquement pour l'administrateur
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;