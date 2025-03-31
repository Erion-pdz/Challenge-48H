const express = require('express');
const router = express.Router();
const path = require('path');

// Route vers le mini-jeu RPG
router.get('/rpg', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rpg.html'));
});

module.exports = router;
