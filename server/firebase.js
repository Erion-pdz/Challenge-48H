const admin = require("firebase-admin");
const serviceAccount = require("./challenge48h-70447-firebase-adminsdk-fbsvc-dc92ead628.json"); // Chemin vers le fichier de clé de service Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // On exporte directement Firestore
module.exports = db;
