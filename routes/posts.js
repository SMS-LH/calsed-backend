const express = require('express');
const router = express.Router();

// On importe toutes les fonctions du contrôleur, y compris updatePost !
const { 
  getPosts, 
  getPostById, 
  createPost, 
  updatePost, // <-- TRÈS IMPORTANT 
  deletePost, 
  likePost, 
  commentPost 
} = require('../controllers/postController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, admin, createPost);

// --- LA ROUTE QUI RÉPARE TON ERREUR 404 ---
router.put('/:id', protect, admin, updatePost); 
// ------------------------------------------

router.delete('/:id', protect, admin, deletePost);
router.put('/:id/like', likePost); 
router.post('/:id/comment', protect, commentPost);

module.exports = router;