const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');
const { sendNewPostAlert } = require('../utils/mailer');

// --- LECTURE ---
exports.getPosts = async (req, res) => {
  try {
    // Récupère les posts du plus récent au plus ancien
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération articles" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Article non trouvé" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- ÉCRITURE (ADMIN) ---
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();

    // Envoi de la Newsletter (Asynchrone pour ne pas bloquer la réponse)
    // On ne bloque pas si l'envoi mail échoue
    Subscriber.find({}).then(subs => {
      if (subs.length > 0) sendNewPostAlert(subs, savedPost);
    });

    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Erreur création article" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Article supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// --- INTERACTIONS (LIKES & COMMENTAIRES) ---
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id; // Vient du token

    // Vérifier si déjà liké
    if (post.likes.includes(userId)) {
      // Si oui, on enlève le like (Unlike)
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Sinon on ajoute
      post.likes.push(userId);
    }

    await post.save();
    res.json(post.likes); // Renvoie la nouvelle liste des likes
  } catch (err) {
    res.status(500).json({ message: "Erreur like" });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    const newComment = {
      author: req.user.name,      // Le nom vient du token décodé
      authorId: req.user.id,
      content: req.body.content,
      date: new Date()
    };

    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Erreur commentaire" });
  }
};