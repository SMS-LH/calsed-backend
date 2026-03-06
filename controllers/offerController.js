const Offer = require('../models/Offer');

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
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
    res.status(201).json(savedOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création offre" });
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