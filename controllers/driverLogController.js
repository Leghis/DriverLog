// controllers/driverLogController.js
// Ajoutez ces deux lignes au début de votre fichier pour configurer le nombre d'éléments par page et pour utiliser la librairie mongoose-paginate
const ITEMS_PER_PAGE = 14;
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const DriverLog = require('../models/driverLog');

// controllers/driverLogController.js
exports.getAllLogs = async (req, res) => {
    const logs = await DriverLog.find();
    res.render('driverlogs', { logs: logs });
};

exports.getLogsJson = async (req, res) => {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);  // Inclure la date de fin

    let filters = {};
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        filters.date = { $gte: startDate, $lt: endDate };
    }
    if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus;
    }

    const page = req.query.page || 1;  // Définit la page courante

    const logs = await DriverLog.paginate(filters, { page, limit: ITEMS_PER_PAGE, sort: { date: -1 } });
    res.json({ logs: logs.docs, total: logs.totalDocs, pages: logs.totalPages });
};


exports.getAllLogsAndTotalCost = async (req, res) => {
    const logs = await DriverLog.find();
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    res.render('driverlogs', { logs: logs, totalCost: totalCost });
};

exports.addLog = async (req, res) => {
    const newLog = new DriverLog(req.body);
    try {
        await newLog.save();
        res.json(newLog);
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplication de clé (date déjà existante)
            res.status(409).json({ message: "Une entrée pour cette date existe déjà!" });
        } else {
            // Autre erreur
            res.status(500).json({ message: err.message || "Une erreur inattendue s'est produite." });
        }
    }
};


exports.updateLog = async (req, res) => {
    const updatedLog = await DriverLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLog);
};

exports.deleteLog = async (req, res) => {
    await DriverLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log deleted' });
};

exports.getTotalCost = async (req, res) => {
    let { startDate, endDate, paymentStatus } = req.query;

    let query = {};
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const logs = await DriverLog.find(query);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

    res.json({ totalCost });
};

exports.exportLogsToPdf = async (req, res) => {
    // Récupérer les données de la même manière que pour la méthode getLogsJson
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);  // Inclure la date de fin

    let filters = {};
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        filters.date = { $gte: startDate, $lt: endDate };
    }
    if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus;
    }

    const logs = await DriverLog.find(filters).sort({ date: -1 });

    // Calculer le nombre de jours travaillés et le coût total
    const workedDays = new Set(logs.map(log => new Date(log.date).toLocaleDateString())).size;
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

    // Créer la définition du document pour pdfMake
    var docDefinition = {
        content: [
            { text: 'Rapport paiement andrée', style: 'header' },
            { text: `Nombre total de jours travaillés : ${workedDays}` },
            { text: `Montant total : ${totalCost} FCFA` },
            {
                style: 'tableExample',
                table: {
                    body: [
                        ['Date', 'Heure d\'Arrivée', 'Coût', 'Status de Paiement'], // Ajoutez ici les autres titres de colonnes
                        ...logs.map(log => [
                            new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                            `${log.arrivalTime}`,
                            `${log.cost}`,
                            `${log.paymentStatus}` // Ajoutez ici les autres champs
                        ])
                    ]
                }
            }
        ]
    };

    // Créer un PDF avec pdfMake
    var pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer(function (buffer) {
        res.end(buffer);
    });
};