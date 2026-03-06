const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, deletePost, likePost, commentPost } = require('../controllers/postController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, admin, createPost); // Seul l'admin poste
router.delete('/:id', protect, admin, deletePost);
router.put('/:id/like', protect, likePost); // Membre connecté peut liker
router.post('/:id/comment', protect, commentPost); // Membre connecté peut commenter

module.exports = router;