const path = require('path');

exports.getAccueil = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Accueil.html'));
}

exports.getRPG = async (req,res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rpg.html'));
}

exports.getRTS = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/rts.html'));
}

exports.getConnect = async (req, res) => {

    res.sendFile(path.join(__dirname, '../../frontEnd/templates/Connect.html'));
}