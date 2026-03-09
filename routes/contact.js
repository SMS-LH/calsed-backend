const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/mailer');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation simple
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
  }

  // Construction du message HTML pour l'admin
  const htmlContent = `
    <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #0A2A5C;">Nouveau message de contact</h2>
      <p><strong>De :</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <hr>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
  `;

 try {
    // On stocke le résultat de l'envoi
    const emailTarget = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const result = await sendEmail(emailTarget, `Contact CALSED: ${subject}`, htmlContent, email);
    
    // Si result est null, l'envoi a échoué silencieusement dans mailer.js
    if (!result) {
      return res.status(500).json({ message: "Le serveur mail est indisponible. Veuillez réessayer plus tard." });
    }
    
    // Si tout va bien, on confirme au frontend
    res.status(200).json({ success: true, message: "Votre message a bien été envoyé." });
    
  } catch (error) {
    console.error("Erreur Contact:", error);
    res.status(500).json({ message: "Erreur critique lors de l'envoi du message." });
  }
});

module.exports = router;