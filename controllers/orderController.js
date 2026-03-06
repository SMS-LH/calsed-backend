const Order = require('../models/Order');
const { sendOrderConfirmation, sendNewOrderAdminAlert, sendOrderDelivered } = require('../utils/mailer');

// Créer une commande (Public ou Membre)
exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // 1. Mail au client
    try {
        await sendOrderConfirmation(savedOrder);
    } catch (e) { console.error("Mail Client Echec", e); }

    // 2. Mail à l'admin
    try {
        await sendNewOrderAdminAlert(savedOrder);
    } catch (e) { console.error("Mail Admin Echec", e); }

    res.status(201).json({ 
        success: true, 
        message: "Commande validée !", 
        orderId: savedOrder._id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la commande" });
  }
};

// Voir toutes les commandes (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
};

// Voir MES commandes (Membre connecté)
exports.getMyOrders = async (req, res) => {
  try {
    // On cherche par email car l'utilisateur n'est pas forcément connecté quand il achète
    // Ou on cherche par ID si ton frontend envoie l'ID utilisateur
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération historique" });
  }
};

// Mettre à jour le statut (Admin : En attente -> Livré)
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