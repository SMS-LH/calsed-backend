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
    Subscriber.find({}).then(subs => {
      if (subs && subs.length > 0) sendNewPostAlert(subs, savedPost);
    }).catch(err => console.error("Erreur newsletter:", err));

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

// MODIFICATION : Gère maintenant les membres ET les visiteurs publics
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Article non trouvé" });

    /**
     * LOGIQUE D'IDENTIFICATION :
     * 1. Si l'utilisateur est connecté, on prend son ID depuis le token (req.user.id)
     * 2. Si c'est un visiteur, on prend l'ID envoyé dans le body (req.body.userId)
     */
    const userId = req.user ? (req.user._id || req.user.id) : req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "Identifiant utilisateur manquant" });
    }

    // Vérifier si déjà liké
    const index = post.likes.indexOf(userId);
    
    if (index !== -1) {
      // Si oui, on enlève le like (Unlike)
      post.likes.splice(index, 1);
    } else {
      // Sinon on ajoute
      post.likes.push(userId);
    }

    await post.save();
    res.json(post.likes); // Renvoie la nouvelle liste des likes
  } catch (err) {
    console.error("Erreur Like:", err);
    res.status(500).json({ message: "Erreur lors de l'action de like" });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Article non trouvé" });
    
    const newComment = {
      author: req.user.name,      // Le nom vient du token décodé (route protégée)
      authorId: req.user.id || req.user._id,
      content: req.body.content,
      date: new Date()
    };

    if (!newComment.content) {
      return res.status(400).json({ message: "Le contenu du commentaire est requis" });
    }

    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" });
  }
};