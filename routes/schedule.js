const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, deleteSchedule, getAllSchedules } = require('../controllers/schedule.controller');


router.post('/create', createSchedule);
router.put('/update/:scheduleId', updateSchedule);
router.delete('/delete/:scheduleId', deleteSchedule)
router.get('/', getAllSchedules)

module.exports = router;
