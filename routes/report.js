const express = require('express');
const router = express.Router();
const authenticateToken= require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');


router.post('/add', authenticateToken, reportController.addReport);  
router.put('/update/:reportId', authenticateToken, reportController.updateReport); 
router.delete('/delete/:reportId', authenticateToken,  reportController.deleteReport);   
router.get('/', authenticateToken, reportController.fetchAllReports);  

router.get('/date-range', authenticateToken, reportController.fetchReportsByDateRange)  

router.get('/export-excel', reportController.exportReportsToExcel)   

module.exports = router;
