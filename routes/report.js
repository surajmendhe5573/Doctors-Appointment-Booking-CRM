const express = require('express');
const router = express.Router();
const authenticateToken= require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');


router.post('/add', authenticateToken, reportController.addReport);  // add report
router.put('/update/:reportId', authenticateToken, reportController.updateReport);  // update report
router.delete('/delete/:reportId', authenticateToken,  reportController.deleteReport);  // delete report 
router.get('/', authenticateToken, reportController.fetchAllReports);  // fetch all reports

router.get('/date-range', authenticateToken, reportController.fetchReportsByDateRange)  // fetch reports date wise

module.exports = router;
