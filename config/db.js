const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // La chaîne de connexion doit être définie dans le fichier .env sous le nom MONGO_URI
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connecté: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        process.exit(1); // Arrête le processus en cas d'échec critique
    }
};

module.exports = connectDB;