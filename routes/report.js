const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');


router.post('/add', reportController.addReport);  // add report
router.put('/update/:reportId', reportController.updateReport);  // update report
router.delete('/delete/:reportId', reportController.deleteReport);  // delete report 
router.get('/', reportController.fetchAllReports);  // fetch all reports

module.exports = router;
