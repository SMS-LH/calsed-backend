const Payment = require("../models/Payment");
const User = require("../models/User"); // Ajout de l'import User
const { sendPaymentDeclarationAlert } = require("../utils/sendEmail"); // Ajout de l'import email

// 1. DÉCLARER UN PAIEMENT (MANUEL OU AUTO)
exports.declareManualPayment = async (req, res) => {
  try {
    const { userId, amount, months, type, reference, status } = req.body;

    const newPayment = new Payment({
      userId: userId.toString(), 
      amount,
      months,
      type,
      reference,
      status: status || 'pending' 
    });

    const savedPayment = await newPayment.save();

    // --- NOUVEAUTÉ : Envoi du mail à l'administrateur ---
    try {
      const user = await User.findById(userId);
      if (user) {
        // On déclenche l'e-mail sans mettre de 'await' pour ne pas faire patienter l'utilisateur
        sendPaymentDeclarationAlert(user, savedPayment).catch(err => {
            console.error("❌ Erreur lors de l'envoi de l'alerte Admin :", err.message);
        });
      }
    } catch (userError) {
      console.error("⚠️ Impossible de récupérer l'utilisateur pour l'e-mail :", userError.message);
    }
    // ----------------------------------------------------

    res.status(201).json({ 
      success: true, 
      message: "Paiement enregistré avec succès", 
      payment: savedPayment 
    });

  } catch (error) {
    console.error("Erreur Payment:", error.message);
    res.status(500).json({ message: "Erreur lors de l'enregistrement du paiement" });
  }
};

// 2. RÉCUPÉRER L'HISTORIQUE
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupération triée par date décroissante (le plus récent en haut)
    const payments = await Payment.find({ userId: userId }).sort({ createdAt: -1 });
    
    res.json(payments);

  } catch (error) {
    console.error("Erreur History:", error);
    res.status(500).json({ message: "Impossible de récupérer l'historique" });
  }
};

// 3. INITIER (Placeholder)
exports.initiatePayment = async (req, res) => {
    res.status(501).json({ message: "Fonctionnalité de paiement en ligne à venir" });
};