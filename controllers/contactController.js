// Assure-toi que le chemin vers ton fichier d'envoi de mail est correct
const { sendEmail } = require('../utils/mailer'); 

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Validation de sécurité côté serveur
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Nom, email et message sont obligatoires." });
    }

    // 2. Préparation du contenu de l'e-mail
    const adminEmail = process.env.ADMIN_EMAIL; // Ton adresse email de réception
    const emailSubject = `📩 Nouveau message CALSED : ${subject || 'Sans sujet'}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0A2A5C; border-bottom: 2px solid #eee; padding-bottom: 10px;">Nouveau message de contact</h2>
        <p><strong>👤 Nom :</strong> ${name}</p>
        <p><strong>📧 Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>📌 Sujet :</strong> ${subject || 'Non précisé'}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0A2A5C; margin-top: 20px;">
          <p style="margin: 0; white-space: pre-wrap; color: #333;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">Cet email a été envoyé depuis le formulaire de contact du site CALSED.</p>
      </div>
    `;

    // 3. Envoi de l'e-mail via ta fonction existante
    // On passe 'email' en 4ème paramètre pour que tu puisses faire "Répondre" directement à l'utilisateur depuis ta boîte mail !
    await sendEmail(adminEmail, emailSubject, emailHtml, email);

    // 4. Réponse de succès au frontend
    res.status(200).json({ success: true, message: "Votre message a bien été envoyé." });

  } catch (error) {
    console.error("❌ Erreur Contact Controller:", error);
    res.status(500).json({ message: "Une erreur est survenue lors de l'envoi de l'e-mail." });
  }
};