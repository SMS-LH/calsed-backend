router.post('/', protect, admin, async (req, res) => {
  // LOG 1 : Vérifier si la requête arrive au serveur
  console.log("--- [START] Requête POST /events reçue ---");
  console.log("Payload reçu :", req.body);

  try {
    const newEvent = new Event({
        ...req.body,
        createdBy: req.user.id
    });
    
    const savedEvent = await newEvent.save();
    
    // LOG 2 : Confirmation de sauvegarde en base
    console.log("✅ Événement enregistré en base de données, ID:", savedEvent._id);

    // --- LOGIQUE ENVOI MAILS ---
    // On ne met pas de await ici pour ne pas faire attendre l'admin
    const processEmails = async () => {
      try {
        console.log("🔍 Recherche des membres approuvés...");
        const members = await User.find({ isApproved: true }, 'email prenom nom name');
        console.log(`📧 Membres trouvés : ${members.length}`);
        
        if (members.length > 0) {
          console.log("🚀 Lancement de l'envoi des emails via sendNewEventAlert...");
          await sendNewEventAlert(members, savedEvent);
          console.log("✅ Processus d'envoi terminé sans erreur fatale.");
        } else {
          console.log("⚠️ Aucun mail envoyé : aucun membre 'isApproved: true' trouvé.");
        }
      } catch (err) {
        console.error("❌ Erreur interne au processus de mail :", err.message);
      }
    };

    // On lance la fonction sans l'attendre
    processEmails();

    // Réponse immédiate au Frontend
    console.log("--- [END] Envoi de la réponse 201 au client ---");
    return res.status(201).json(savedEvent);

  } catch (err) {
    // LOG D'ERREUR CRITIQUE
    console.error("❌ ERREUR GLOBALE route POST /events :", err.message);
    return res.status(400).json({ message: err.message });
  }
});