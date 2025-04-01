const express = require('express');
const router = express.Router();

const controllers = require("../controller/controller.js");

router.get("/accueil", controllers.getAccueil); // Route vers la page Accueil
router.get("/connect", controllers.getConnect); // Route vers la page de connexion ou de création de compte
router.get("/rts", controllers.getRTS); // Route vers le mini-jeu RTS
router.get('/rpg', controllers.getRPG); // Route vers le mini-jeu RPG


module.exports = router;
