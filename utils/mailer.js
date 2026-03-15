const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
// --- CONFIGURATION GMAIL API (HTTPS - PORT 443) ---
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// --- FONCTION GÉNÉRIQUE D'ENVOI VIA HTTP ---
const sendEmail = async (to, subject, htmlContent, replyTo = null) => {
  try {
    // 1. Nodemailer "dessine" le mail avec les bons standards HTML/CSS
    const mail = new MailComposer({
      from: `"Réseau CALSED" <${process.env.EMAIL_USER}>`,
      to: to,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      html: htmlContent,
      textEncoding: 'base64'
    });

    // On génère le code parfait du mail
    const messageBuffer = await mail.compile().build();
    
    // 2. On encode ce code au format strict exigé par Google API
    const encodedMessage = messageBuffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 3. On envoie via HTTPS (Ça passe Render sans souci !)
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    if (!Array.isArray(to)) console.log('✅ Email envoyé avec un design parfait (ID: ' + res.data.id + ')');
    return res;
  } catch (error) {
    console.error("❌ Erreur d'envoi API Gmail:", error.message);
    return null;
  }
};

// --- MAILS EXISTANTS (INSCRIPTIONS) ---

const sendAdminNotification = async (newUser) => {
  const html = `
    <div style="font-family: sans-serif; border: 2px solid #0A2A5C; padding: 20px; max-width: 600px;">
      <h2 style="color: #0A2A5C; border-bottom: 1px solid #eee; padding-bottom: 10px;">Nouvelle demande CALSED</h2>
      <p>Un nouvel utilisateur s'est inscrit :</p>
      <p><strong>Nom :</strong> ${newUser.name}</p>
      <p><strong>Email :</strong> ${newUser.email}</p>
      <p><strong>Téléphone :</strong> ${newUser.phone}</p>
      <p><strong>Promotion :</strong> ${newUser.generation}</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/admin" style="background: #0A2A5C; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Voir le Dashboard</a>
    </div>`;
  return sendEmail(process.env.ADMIN_EMAIL, "🔔 Nouvelle inscription - Action Requise", html);
};

const sendMemberStatusEmail = async (userEmail, userName, isApproved) => {
  const subject = isApproved ? "✅ Compte Validé" : "❌ Statut inscription";
  const html = `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      ${isApproved 
        ? `<h1 style="color: #0A2A5C;">Bienvenue ${userName} !</h1><p>Votre compte a été validé.</p>` 
        : `<h1 style="color: #d9534f;">Désolé ${userName}</h1><p>Votre demande n'a pas été approuvée.</p>`}
    </div>`;
  return sendEmail(userEmail, subject, html);
};

// --- NOUVEAU : MAIL DE RELANCE COTISATION ---
const sendReminderEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0A2A5C; margin: 0;">Bonjour ${name},</h2>
      </div>
      <p style="color: #555; line-height: 1.6;">Sauf erreur de notre part, votre cotisation au réseau CALSED est arrivée à échéance.</p>
      <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <strong>Pourquoi cotiser ?</strong><br>Votre soutien finance l'annuaire, les événements et les bourses solidaires.
      </div>
      <p style="color: #555;">Pour continuer à profiter de tous les services, nous vous invitons à régulariser votre situation en vous connectant à votre espace membre.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/membre" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Régulariser ma cotisation</a>
      </div>
      <br/><hr style="border: 0; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888; text-align: center;">Si vous avez déjà effectué votre paiement, merci d'ignorer ce message.<br>Cordialement, <strong>Le Bureau CALSED</strong></p>
    </div>`;
  return sendEmail(email, '⚠️ Rappel : Renouvellement de votre cotisation', html);
};

// --- SÉCURITÉ : MOT DE PASSE OUBLIÉ ---
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0A2A5C; text-align: center;">Mot de passe oublié ?</h2>
      <p>Bonjour,</p>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte CALSED.</p>
      <p>Cliquez sur le bouton ci-dessous pour en définir un nouveau :</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
      </div>
      <p>Ou copiez ce lien : <br><small>${resetUrl}</small></p>
      <p>Ce lien est valide pour une durée limitée (1 heure).</p>
      <hr style="border: 0; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
    </div>`;
  return sendEmail(email, '🔒 Réinitialisation de votre mot de passe', html);
};

// --- MAILS BOUTIQUE ---

const sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(item => 
    `<li style="margin-bottom: 5px;">${item.name} (x${item.quantity}) - <strong>${item.price} FCFA</strong></li>`
  ).join('');
  const html = `
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
    </div>`;
  return sendEmail(order.email, `✅ Confirmation Commande #${order._id.toString().slice(-6)}`, html);
};

const sendNewOrderAdminAlert = async (order) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #d97706;">Nouvelle commande reçue !</h2>
      <p><strong>Client :</strong> ${order.customerName}</p>
      <p><strong>Montant :</strong> ${order.totalAmount.toLocaleString()} FCFA</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/admin" style="background: #0A2A5C; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Gérer la commande</a>
    </div>`;
  return sendEmail(process.env.ADMIN_EMAIL, `💰 Nouvelle Vente : ${order.totalAmount} FCFA`, html);
};

const sendOrderDelivered = async (order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #2da44e;">Colis Livré !</h2>
      <p>Bonjour ${order.customerName},</p>
      <p>Votre commande a été marquée comme livrée.</p>
      <p>Merci de soutenir le réseau CALSED et à très bientôt !</p>
    </div>`;
  return sendEmail(order.email, "📦 Votre commande CALSED est livrée", html);
};

// --- NEWSLETTER ---

const sendNewPostAlert = async (subscribers, post) => {
  const subject = `📢 Nouvel article : ${post.title}`;
  const promises = subscribers.map(sub => {
    const html = `
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
      </div>`;
    return sendEmail(sub.email, subject, html);
  });
  return Promise.all(promises);
};

const sendNewProductAlert = async (subscribers, product) => {
  const subject = `🛍️ Nouveauté Boutique : ${product.name}`;
  const promises = subscribers.map(sub => {
    const html = `
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
      </div>`;
    return sendEmail(sub.email, subject, html);
  });
  return Promise.all(promises);
};

// --- NOUVEAU : ALERTE DÉCLARATION COTISATION (WAVE/OM) ---
const sendPaymentDeclarationAlert = async (user, payment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0A2A5C; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px;">💰 Déclaration de Cotisation</h2>
      <p>Bonjour Admin,</p>
      <p>Le membre <strong>${user.prenom} ${user.nom}</strong> vient de déclarer avoir effectué un transfert pour sa cotisation.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Montant attendu :</strong> <span style="font-size: 18px; font-weight: bold; color: #0A2A5C;">${payment.amount.toLocaleString()} FCFA</span></p>
        <p style="margin: 5px 0;"><strong>Nombre de mois :</strong> ${payment.months}</p>
        <p style="margin: 5px 0;"><strong>Email du membre :</strong> ${user.email}</p>
      </div>

      <p style="color: #555; line-height: 1.5;"><strong>Action requise :</strong><br> Veuillez vérifier votre solde Wave ou Orange Money. Si le transfert a bien été reçu, rendez-vous sur le tableau de bord Administrateur pour valider le paiement.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/admin" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Valider sur le Dashboard</a>
      </div>
    </div>`;
  
  return sendEmail(process.env.EMAIL_USER, `💸 Nouvelle Déclaration : ${payment.amount} FCFA de ${user.prenom} ${user.nom}`, html);
};

// --- NOUVEAU : ALERTE CRÉATION D'ÉVÉNEMENT ---
const sendNewEventAlert = async (members, event) => {
  const subject = `📅 Nouvel événement CALSED : ${event.title}`;

  // Formatage de la date (s'assure d'avoir un bel affichage en français)
  const eventDateObj = new Date(event.date);
  const eventDate = eventDateObj.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  // Extraction de l'heure. Si event.time n'existe pas, on tente de la récupérer depuis event.date
  const eventTime = event.time || eventDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const promises = members.map(member => {
    const html = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; max-width: 600px; margin: auto; border-radius: 8px;">
        <div style="background-color: #0A2A5C; padding: 15px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h2 style="margin:0;">Agenda du CALSED</h2>
        </div>
        <div style="padding: 20px; background-color: #fcfcfc;">
          <h2 style="color: #d97706; text-align: center; margin-top: 0;">📅 ${event.title}</h2>
          <p>Bonjour ${member.prenom || member.name || ''},</p>
          <p>Le réseau CALSED a le plaisir de vous convier à un nouvel événement :</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #0A2A5C; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 5px 0;"><strong>🏷️ Type :</strong> <span style="background: #e0e7ff; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${event.type || 'Événement'}</span></p>
            <p style="margin: 5px 0;"><strong>🕒 Date et heure :</strong> Le ${eventDate} à ${eventTime}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu / Lien :</strong> ${event.location || 'À définir'}</p>
            ${event.description ? `<p style="margin: 15px 0 5px 0; color: #555; font-style: italic;">"${event.description}"</p>` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL}/evenements" style="background-color: #0A2A5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Consulter le calendrier</a>
          </div>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 12px; color: #888; text-align: center;">Vous recevez cet email car vous êtes inscrit(e) dans l'annuaire du réseau CALSED.</p>
      </div>`;
    
    return sendEmail(member.email, subject, html);
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
  sendNewProductAlert,
  sendPaymentDeclarationAlert,
  sendNewEventAlert // <-- N'oubliez pas l'export !
};