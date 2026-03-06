const Product = require('../models/Product');
const Subscriber = require('../models/Subscriber');
const { sendNewProductAlert } = require('../utils/mailer');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Erreur chargement produits" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    // Alerte mail facultative pour les nouveaux produits
    Subscriber.find({}).then(subs => {
      if (subs.length > 0) sendNewProductAlert(subs, savedProduct);
    });

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: "Erreur création produit" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression" });
  }
};