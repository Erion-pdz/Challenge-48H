const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../firebase'); // <- firestore direct

// Envoie les pages HTML
exports.getAccueil = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Accueil.html'));
};

exports.getRPG = async (req,res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rpg.html'));
}

exports.getRTS = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rts.html'));
}

exports.getConnect = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Connect.html'));
}

exports.getChest = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/chest.html'));
}

exports.getFPS = async (req, res) =>{
    
    res.sendFile(path.join(__dirname, '../../frontEnd/templates/fps.html'));
}