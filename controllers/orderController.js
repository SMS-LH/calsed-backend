// CORRECTION : On pointe sur le modèle Order (et non Post)
const Order = require('../models/Order'); 
const Subscriber = require('../models/Subscriber');
const { sendOrderConfirmation, sendNewOrderAdminAlert, sendOrderDelivered } = require('../utils/mailer');

// --- CRÉER UNE COMMANDE (Public ou Membre) ---
exports.createOrder = async (req, res) => {
  try {
    // SÉCURITÉ : On extrait les données du body
    const orderData = { ...req.body };

    // HARMONISATION : Le modèle attend 'customerName', le frontend envoie 'name'
    if (req.body.name && !req.body.customerName) {
      orderData.customerName = req.body.name;
    }

    // Gestion de l'utilisateur (Membre vs Invité)
    if (req.user) {
      orderData.user = req.user.id || req.user._id;
    } else {
      // Pour un invité, on s'assure que le champ user est totalement absent ou null
      orderData.user = null; 
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    // 1. Mail au client (Non-bloquant pour la réponse API)
    sendOrderConfirmation(savedOrder).catch(e => console.error("Mail Client Echec", e));

    // 2. Mail à l'admin (Non-bloquant)
    sendNewOrderAdminAlert(savedOrder).catch(e => console.error("Mail Admin Echec", e));

    res.status(201).json({ 
        success: true, 
        message: "Commande validée !", 
        orderId: savedOrder._id 
    });

  } catch (err) {
    console.error("ERREUR CRITIQUE COMMANDE:", err);
    
    // Si l'erreur est une erreur de validation Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Données de commande invalides", 
        details: err.message 
      });
    }

    res.status(500).json({ 
        message: "Erreur lors de la validation de la commande",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// --- VOIR TOUTES LES COMMANDES (Admin) ---
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
};

// --- VOIR MES COMMANDES (Membre connecté) ---
exports.getMyOrders = async (req, res) => {
  try {
    // SÉCURITÉ : On vérifie que req.user existe avant d'accéder à l'email
    if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "Vous devez être connecté pour voir vos commandes" });
    }

    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération historique" });
  }
};

// --- METTRE À JOUR LE STATUT (Admin : En attente -> Livré) ---
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, isDelivered } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    order.status = status || order.status;
    if (isDelivered !== undefined) order.isDelivered = isDelivered;

    await order.save();

    // Si on marque comme livré, on prévient le client
    if (status === 'Livré' || isDelivered === true) {
        sendOrderDelivered(order).catch(err => console.log("Mail livraison échec"));
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};