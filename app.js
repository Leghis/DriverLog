var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { engine } = require('express-handlebars');

var indexRouter = require('./routes/driverLogRoutes');
const mongoose = require("mongoose");
const fs = require("fs");

var app = express();

// view engine setup
// Setup handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Connexion à la base de données
mongoose.connect("mongodb://127.0.0.1:27017/driver_log_db", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connexion à la base de données réussie');

        // Configuration des routes
        app.use('/', indexRouter);

        // Configuration pour utiliser les fichiers statiques
        app.use(express.static(__dirname + '/public'));


        // Définition du port d'écoute
        const port = process.env.PORT || 3000;

        // Démarrage du serveur
        app.listen(port, () => {
            console.log(`Le serveur est démarré sur le port ${port}`);
        });
    })
    .catch((err) => {
        console.log('Erreur lors de la connexion à la base de données :', err);
    });


module.exports = app;
