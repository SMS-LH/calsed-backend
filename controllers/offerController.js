const Offer = require('../models/Offer');

exports.getOffers = async (req, res) => {
  try {
    // CORRECTION : On utilise populate pour aller chercher le nom et la photo du créateur !
    const offers = await Offer.find()
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération offres" });
  }
};

exports.createOffer = async (req, res) => {
  try {
    // On ajoute l'auteur automatiquement via le token
    const offerData = {
        ...req.body,
        author: req.user.id,
        authorId: req.user.id // Pour compatibilité frontend
    };

    const newOffer = new Offer(offerData);
    const savedOffer = await newOffer.save();
    
    // On peuple l'auteur avant de renvoyer l'offre nouvellement créée au frontend
    await savedOffer.populate('author', 'name avatar');
    
    res.status(201).json(savedOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création offre" });
  }
};

// --- NOUVEAU : Fonction pour modifier une offre ---
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });

    // Vérification de sécurité : Seul l'auteur ou un admin peut modifier
    if (offer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette offre" });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Renvoie la nouvelle version
    ).populate('author', 'name avatar');

    res.json(updatedOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });

    // Vérification : Seul l'admin ou le créateur peut supprimer
    if (offer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offre supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression" });
  }
};