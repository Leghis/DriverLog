const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const driverLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique:true
    },
    arrivalTime: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        default: 1200, // Si le coût est toujours le même, nous pouvons le définir par défaut ici.
    },
    paymentStatus: {
        type: String,
        enum: ['Not Paid', 'Paid'], // Assurez-vous que le statut de paiement est soit 'Paid' soit 'Unpaid'
        required: true,
    },
});
// Ajoutez ceci pour ajouter la pagination à votre modèle
driverLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('DriverLog', driverLogSchema);
