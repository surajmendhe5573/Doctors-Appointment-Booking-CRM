const express = require('express');
const router = express.Router();
const authenticateToken= require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');


router.post('/add', authenticateToken, reportController.addReport);  // add report
router.put('/update/:reportId', reportController.updateReport);  // update report
router.delete('/delete/:reportId', reportController.deleteReport);  // delete report 
router.get('/', reportController.fetchAllReports);  // fetch all reports

router.get('/date-range', reportController.fetchReportsByDateRange)  // fetch reports date wise

module.exports = router;
