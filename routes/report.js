const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');


router.post('/add', reportController.addReport);  // Add a new report
router.put('/update/:id', reportController.updateReport);  // Update an existing report
router.delete('/delete/:id', reportController.deleteReport);  // Delete a report
router.get('/', reportController.getReports); // Fetch all reports


module.exports = router;
