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
    // Envoi à l'email configuré dans .env (ADMIN_EMAIL ou EMAIL_USER)
    await sendEmail(process.env.ADMIN_EMAIL || process.env.EMAIL_USER, `Contact CALSED: ${subject}`, htmlContent, email);
    
    res.status(200).json({ success: true, message: "Votre message a bien été envoyé." });
  } catch (error) {
    console.error("Erreur Contact:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
});

module.exports = router;