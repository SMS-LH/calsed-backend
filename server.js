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
const connectDB = require('./config/db');

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
const settingRoutes = require('./routes/settingRoutes');
const teamRoutes = require('./routes/teamRoutes'); // <-- AJOUT : Route Bureau National

// --- INITIALISATION APP ---
const app = express();

// Indispensable pour Render (détection correcte des IP derrière le proxy)
app.set('trust proxy', 1);

// --- CONNEXION BASE DE DONNÉES ---
connectDB();

// --- CONFIGURATION MIDDLEWARES GLOBAUX ---

// Helmet : On autorise les ressources externes (Cloudinary)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

// Configuration CORS : Tu peux restreindre à ton FRONTEND_URL en production
app.use(cors());

// --- CORRECTION PAYLOAD (Articles longs & Images Base64) ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de requêtes depuis cette IP."
});
app.use('/api', limiter);

// --- GESTION DES FICHIERS STATIQUES ---
// On garde cette partie pour ne pas casser d'anciennes images, 
// mais Cloudinary prendra le relais pour les nouvelles.
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
app.use('/api/settings', settingRoutes);
app.use('/api/team', teamRoutes); // <-- AJOUT : Liaison de la route Team

// --- ROUTE DE SANTÉ ---
app.get('/', (req, res) => {
  res.status(200).send('🚀 API CALSED opérationnelle, synchronisée et sécurisée !');
});

// --- GESTION DES ERREURS 404 ---
app.use((req, res) => {
    res.status(404).json({ message: "Route non trouvée sur le serveur" });
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});