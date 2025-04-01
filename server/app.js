const express = require('express');
const path = require('path');
const app = express();
const routes = require('./routes/route.js');

// Sert les fichiers statiques (css, js, images)
app.use("/assets", express.static(path.join(__dirname, "../frontEnd/assets")));

// Routes HTML
app.use("/", routes);

// Lancement du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});