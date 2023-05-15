// routes/driverLogRoutes.js

const express = require('express');
const driverLogController = require('../controllers/driverLogController');
const router = express.Router();

router.get('/', driverLogController.getAllLogs);
router.post('/', driverLogController.addLog);
router.get('/json', driverLogController.getLogsJson);
router.put('/:id', driverLogController.updateLog);
router.delete('/:id', driverLogController.deleteLog);
router.get('/total-cost', driverLogController.getTotalCost);
router.get('/logs/export/pdf', driverLogController.exportLogsToPdf);


module.exports = router;
