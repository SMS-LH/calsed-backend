const nodemailer = require('nodemailer');

// --- CONFIGURATION GMAIL OAUTH2 (Sécurisé pour Render) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN
  }
});

// Vérification de la connexion au lancement
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Erreur de configuration mail OAuth2 :", error.message);
  } else {
    console.log("✅ Serveur de mail CALSED prêt (Connecté via Google API)");
  }
});

// --- FONCTION GÉNÉRIQUE (Pour Contact, Newsletter, etc.) ---
const sendEmail = async (to, subject, htmlContent, replyTo = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    if (!Array.isArray(to)) console.log('Email envoyé: ' + info.response);
    return info;
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
    return null;
  }
};

// --- MAILS EXISTANTS (INSCRIPTIONS) ---

const sendAdminNotification = async (newUser) => {
  const mailOptions = {
    from: `"CALSED Robot" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "🔔 Nouvelle inscription - Action Requise",
    html: `
      <div style="font-family: sans-serif; border: 2px solid #0A2A5C; padding: 20px; max-width: 600px;">
        <h2 style="color: #0A2A5C; border-bottom: 1px solid #eee; padding-bottom: 10px;">Nouvelle demande CALSED</h2>
        <p>Un nouvel utilisateur s'est inscrit :</p>
        <p><strong>Nom :</strong> ${newUser.name}</p>
        <p><strong>Email :</strong> ${newUser.email}</p>
        <p><strong>Téléphone :</strong> ${newUser.phone}</p>
        <p><strong>Promotion :</strong> ${newUser.generation}</p>
        <br>
        <a href="${process.env.FRONTEND_URL}/admin" style="background: #0A2A5C; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Voir le Dashboard</a>
      </div>`
  };
  return transporter.sendMail(mailOptions);
};

const sendMemberStatusEmail = async (userEmail, userName, isApproved) => {
  const mailOptions = {
    from: `"Bureau CALSED" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: isApproved ? "✅ Compte Validé" : "❌ Statut inscription",
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        ${isApproved 
          ? `<h1 style="color: #0A2A5C;">Bienvenue ${userName} !</h1><p>Votre compte a été validé.</p>` 
          : `<h1 style="color: #d9534f;">Désolé ${userName}</h1><p>Votre demande n'a pas été approuvée.</p>`}
      </div>`
  };
  return transporter.sendMail(mailOptions);
};

// --- NOUVEAU : MAIL DE RELANCE COTISATION ---
const sendReminderEmail = async (email, name) => {
  const mailOptions = {
    from: `"Trésorerie CALSED" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '⚠️ Rappel : Renouvellement de votre cotisation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0A2A5C; margin: 0;">Bonjour ${name},</h2>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          Sauf erreur de notre part, votre cotisation au réseau CALSED est arrivée à échéance.
        </p>
        
        <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <strong>Pourquoi cotiser ?</strong><br>
          Votre soutien finance l'annuaire, les événements et les bourses solidaires.
        </div>

        <p style="color: #555;">
          Pour continuer à profiter de tous les services (Annuaire, Offres d'emploi, etc.), nous vous invitons à régulariser votre situation en vous connectant à votre espace membre.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/membre" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Régulariser ma cotisation
          </a>
        </div>

        <br/>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          Si vous avez déjà effectué votre paiement, merci d'ignorer ce message.
          <br>Cordialement, <strong>Le Bureau CALSED</strong>
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Relance envoyée à ${email}`);
  } catch (error) {
    console.error("❌ Erreur NodeMailer Relance:", error);
    throw error;
  }
};

// --- SÉCURITÉ : MOT DE PASSE OUBLIÉ ---
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"Sécurité CALSED" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0A2A5C; text-align: center;">Mot de passe oublié ?</h2>
        <p>Bonjour,</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte CALSED.</p>
        <p>Cliquez sur le bouton ci-dessous pour en définir un nouveau :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p>Ou copiez ce lien : <br><small>${resetUrl}</small></p>
        <p>Ce lien est valide pour une durée limitée (1 heure).</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

// --- MAILS BOUTIQUE ---

const sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(item => 
    `<li style="margin-bottom: 5px;">${item.name} (x${item.quantity}) - <strong>${item.price} FCFA</strong></li>`
  ).join('');

  const mailOptions = {
    from: `"CALSED Boutique" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `✅ Confirmation Commande #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; background-color: #0A2A5C; padding: 15px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin:0;">Merci pour votre commande !</h2>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour <strong>${order.customerName}</strong>,</p>
          <p>Nous avons bien reçu votre commande. Voici le récapitulatif :</p>
          <ul style="background: #f9f9f9; padding: 15px; list-style: none; border-radius: 5px;">${itemsList}</ul>
          <p style="text-align: right; font-size: 18px;"><strong>Total : ${order.totalAmount.toLocaleString()} FCFA</strong></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Adresse de livraison :</strong><br>${order.address}, ${order.city}<br>Tél : ${order.phone}</p>
        </div>
      </div>`
  };
  return transporter.sendMail(mailOptions);
};

const sendNewOrderAdminAlert = async (order) => {
  const mailOptions = {
    from: `"Boutique Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `💰 Nouvelle Vente : ${order.totalAmount} FCFA`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #d97706;">Nouvelle commande reçue !</h2>
        <p><strong>Client :</strong> ${order.customerName}</p>
        <p><strong>Montant :</strong> ${order.totalAmount.toLocaleString()} FCFA</p>
        <br>
        <a href="${process.env.FRONTEND_URL}/admin" style="background: #0A2A5C; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Gérer la commande</a>
      </div>`
  };
  return transporter.sendMail(mailOptions);
};

const sendOrderDelivered = async (order) => {
  const mailOptions = {
    from: `"CALSED Livraison" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: "📦 Votre commande CALSED est livrée",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #2da44e;">Colis Livré !</h2>
        <p>Bonjour ${order.customerName},</p>
        <p>Votre commande a été marquée comme livrée.</p>
        <p>Merci de soutenir le réseau CALSED et à très bientôt !</p>
      </div>`
  };
  return transporter.sendMail(mailOptions);
};

// --- NEWSLETTER ---

const sendNewPostAlert = async (subscribers, post) => {
  const subject = `📢 Nouvel article : ${post.title}`;
  const promises = subscribers.map(sub => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; max-width: 600px; margin: auto;">
        <div style="background-color: #0A2A5C; padding: 15px; text-align: center; color: white;">
          <h2 style="margin:0;">Journal du CALSED</h2>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour,</p>
          <p>Un nouvel article vient d'être publié sur le site :</p>
          <h3 style="color: #0A2A5C;">${post.title}</h3>
          <p><em>"${post.excerpt || 'Cliquez ci-dessous pour découvrir le contenu...'}"</em></p>
          <br>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/blog/${post._id}" style="background-color: #d97706; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Lire l'article</a>
          </div>
          <br>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666; text-align: center;">Vous recevez cet email car vous êtes abonné à la newsletter CALSED.</p>
        </div>
      </div>
    `;
    return sendEmail(sub.email, subject, htmlContent);
  });
  return Promise.all(promises);
};

const sendNewProductAlert = async (subscribers, product) => {
  const subject = `🛍️ Nouveauté Boutique : ${product.name}`;
  const promises = subscribers.map(sub => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; max-width: 600px; margin: auto;">
        <div style="background-color: #0A2A5C; padding: 15px; text-align: center; color: white;">
          <h2 style="margin:0;">CALSED Boutique</h2>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #d97706; text-align: center;">✨ Nouveauté disponible !</h2>
          <p>Le produit <strong>${product.name}</strong> vient d'arriver en boutique.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Prix :</strong> ${product.price} FCFA</p>
            <p style="margin: 5px 0;">${product.description.substring(0, 100)}...</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/boutique" style="background-color: #0A2A5C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir le produit</a>
          </div>
        </div>
      </div>
    `;
    return sendEmail(sub.email, subject, htmlContent);
  });
  return Promise.all(promises);
};

module.exports = { 
  sendEmail, 
  sendAdminNotification, 
  sendMemberStatusEmail,
  sendReminderEmail, 
  sendResetPasswordEmail,
  sendOrderConfirmation,
  sendNewOrderAdminAlert,
  sendOrderDelivered,
  sendNewPostAlert, 
  sendNewProductAlert 
};