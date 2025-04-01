const express = require('express');
const router = express.Router();

const controllers = require("../controller/controller.js");

router.get("/accueil", controllers.getAccueil); // Route vers la page Accueil
router.get("/connect", controllers.getConnect); // Route vers la page de connexion ou de création de compte
router.get("/rts", controllers.getRTS); // Route vers le mini-jeu RTS
router.get('/rpg', controllers.getRPG); // Route vers le mini-jeu RPG
router.get("/chest", controllers.getChest); // Route vers la page du coffre
router.get("/fps", controllers.getFPS);

router.post("/login", controllers.postLogin); // Traite la connexion
router.post("/register", controllers.postRegister); // Traite la création de compte
router.get("/test-firestore", controllers.testFirestore);
router.post("/rts-cle", controllers.postRTS);
router.post("/rpg-cle", controllers.postRPG); // Traite la création de compte pour le mini-jeu RPG


module.exports = router;
