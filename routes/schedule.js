const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, deleteSchedule, getAllSchedules, toggleScheduleStatus, transferAppointment } = require('../controllers/schedule.controller');


router.post('/create', createSchedule);
router.put('/update/:scheduleId', updateSchedule);
router.delete('/delete/:scheduleId', deleteSchedule)
router.get('/', getAllSchedules)

router.put("/:scheduleId/status", toggleScheduleStatus);  // Toggle status (Done or Upcoming) / Not Available
router.put('/:scheduleId', transferAppointment);  // Route for transferring an appointment (update doctor or hospital)

module.exports = router;
