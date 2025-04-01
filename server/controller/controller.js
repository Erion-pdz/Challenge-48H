const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../firebase'); // <- firestore direct


exports.getAccueil = async (req, res) => {
    const pseudo = req.query.pseudo; 
    if (!pseudo) return res.send("❌ Aucun pseudo fourni.");

    const userRef = db.collection("users").doc(pseudo);
    const userDoc = await userRef.get();

    const cles = userDoc.exists ? userDoc.data().cles || [] : [];

    // on prépare les données à envoyer à la page HTML
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Accueil.html'));

    // 💡 Option : tu pourrais passer les clés via une version ejs ou un script JS dynamique
};
exports.getRPG = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rpg.html'));
};
exports.postRPG= async (req, res) => {
    const { pseudo } = req.body;

    if (!pseudo) return res.status(400).send("Pseudo requis.");

    const userRef = db.collection("users").doc(pseudo);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).send("Utilisateur non trouvé.");
    }

    const userData = userDoc.data();
    const cles = userData.cles || [];

    if (!cles.includes("rpg")) {
        cles.push("rpg");
        await userRef.update({ cles });
    }

    res.send("✅ Clé RPG enregistrée !");
};


exports.getRTS = async (req, res) => {
    if (!pseudo) {
        return res.redirect("/connect"); 
    }
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rts.html'));
};
exports.postRTS = async (req, res) => {
    const { pseudo } = req.body;

    if (!pseudo) return res.status(400).send("❌ Pseudo manquant");

    const userRef = db.collection("users").doc(pseudo);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).send("❌ Utilisateur introuvable");
    }

    const userData = userDoc.data();
    const cles = userData.cles || [];

    if (!cles.includes("rts")) {
        cles.push("rts");
        await userRef.update({ cles });
        console.log(`🔐 Clé RTS ajoutée pour ${pseudo}`);
    }

    res.send("✅ Clé RTS enregistrée !");
};


exports.getConnect = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Connect.html'));
};

// Enregistrement d'un utilisateur
exports.postRegister = async (req, res) => {
    const { pseudo, password } = req.body;

    try {
        const userRef = db.collection('users').doc(pseudo);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(400).send("❌ Pseudo déjà utilisé.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userRef.set({
            pseudo,
            password: hashedPassword,
            createdAt: new Date()
        });

        // res.send("✅ Compte créé avec succès !");
        res.redirect("/connect");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'inscription.");
    }
};

// Connexion d'un utilisateur
exports.postLogin = async (req, res) => {
    const { pseudo, password } = req.body;

    try {
        const userRef = db.collection('users').doc(pseudo);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).send("❌ Utilisateur non trouvé.");
        }

        const user = doc.data();
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).send("❌ Mot de passe incorrect.");
        }

        // res.send(`✅ Bienvenue ${pseudo} !`); /accueil
        res.redirect("/accueil?pseudo=${pseudo}");

    } catch (error) {
        console.error(error);
        console.error("🔥 Erreur lors de l'inscription :", error.message);

        res.status(500).send("Erreur lors de la connexion.");
    }
};
exports.testFirestore = async (req, res) => {
    const db = require('../firebase');
    try {
        await db.collection('test').doc('ping').set({ hello: 'world' });
        res.send("✅ Firestore fonctionne !");
    } catch (error) {
        console.error("🔥 Firestore KO :", error.message);
        res.status(500).send("❌ Firestore ne répond pas.");
    }
};

