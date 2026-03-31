# 🎓 CALSED - Serveur API (Backend)

Bienvenue sur le code source du serveur et de l'API du projet **CALSED** (Collectif des Anciens du Lycée Scientifique d'Excellence de Diourbel).



## 🚀 Ce que fait cette partie du projet
C'est le "cerveau" du site. Il tourne en arrière-plan, gère la base de données et assure la sécurité :
* **Authentification** : Connexion sécurisée, JWT, et validation des comptes par les administrateurs.
* **Système de Mailing Avancé** : Envoi automatisé de notifications HTML (alertes d'inscription, validation de compte, relance de cotisation, reçus de boutique, newsletters, et alertes de transfert Wave/OM).
* **Boutique & Commandes** : Enregistrement des commandes e-commerce.
* **Upload d'images** : Stockage des photos de profil et des produits en lien avec Cloudinary.
* **Base de données** : Stockage des membres, des offres d'emploi et des événements.

## 🛠️ Technologies utilisées
* **Node.js & Express.js** (Pour créer le serveur et l'API)
* **MongoDB & Mongoose** (Base de données)
* **Nodemailer & Google APIs (OAuth2)** (Pour envoyer des emails de manière ultra-sécurisée et éviter les blocages SMTP des hébergeurs gratuits)
* **Cloudinary** (Hébergement des images)
* **Bcrypt & JWT** (Pour la sécurité des mots de passe et des connexions)

## ⚙️ Comment lancer ce code sur ton ordinateur pour m'aider ?
Si tu veux faire tourner l'API chez toi pour m'aider à debugger :

1. Installe les dépendances avec la commande : 
   `npm install`

2. Crée un fichier `.env` à la racine et ajoute ces variables (demande-moi les vraies valeurs en privé) :
   ```env
   # --- SERVEUR & BASE DE DONNÉES ---
   PORT=5000
   MONGO_URI=ton_lien_mongodb
   FRONTEND_URL=http://localhost:3000

   # --- SÉCURITÉ ---
   JWT_SECRET=ta_cle_secrete_jwt

   # --- UPLOADS CLOUDINARY ---
   CLOUDINARY_CLOUD_NAME=ton_cloud_name
   CLOUDINARY_API_KEY=ta_cle_api
   CLOUDINARY_API_SECRET=ton_secret_api

   # --- MAILING (GMAIL API OAUTH2) ---
   EMAIL_USER=ton_email_calsed@gmail.com
   ADMIN_EMAIL=email_du_bureau@gmail.com
   GMAIL_CLIENT_ID=ton_client_id_google
   GMAIL_CLIENT_SECRET=ton_client_secret_google
   GMAIL_REFRESH_TOKEN=ton_refresh_token_google
   
3. Démarre le serveur avec la commande :
   `npm run dev` (Le serveur écoutera sur le port 5000).
