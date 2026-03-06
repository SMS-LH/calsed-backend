require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// --- SÉCURITÉ & PERFORMANCES ---
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// --- CONFIGURATION ---
const connectDB = require('./config/db'); // Utilisation de ta nouvelle config DB

// --- IMPORT DES ROUTES ---
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const offersRoutes = require('./routes/offers');
const eventRoutes = require('./routes/events');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const donateRoutes = require('./routes/donate');
const newsletterRoutes = require('./routes/newsletter');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/paymentRoutes');

// --- INITIALISATION APP ---
const app = express();

// --- CONNEXION BASE DE DONNÉES ---
connectDB(); // Appel de la fonction isolée dans config/db.js

// --- CONFIGURATION MIDDLEWARES GLOBAUX ---

// 1. Sécurité des Headers (Helmet)
// Note: On configure crossOriginResourcePolicy pour autoriser l'affichage des images uploadées
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// 2. Compression des réponses (Vitesse)
app.use(compression());

// 3. Gestion des CORS
app.use(cors());

// 4. Parsing JSON
app.use(express.json());

// 5. Limitation des requêtes (Rate Limiting)
// Limite chaque IP à 100 requêtes toutes les 15 minutes pour éviter le DDOS/Brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard."
});
app.use('/api', limiter); // Appliqué uniquement sur les routes API

// --- GESTION DES FICHIERS STATIQUES ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

// --- ROUTE DE SANTÉ (HEALTH CHECK) ---
app.get('/', (req, res) => {
  res.status(200).send('🚀 API CALSED opérationnelle et sécurisée !');
});

// --- GESTION DES ERREURS 404 ---
app.use((req, res, next) => {
    res.status(404).json({ message: "Route non trouvée" });
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});