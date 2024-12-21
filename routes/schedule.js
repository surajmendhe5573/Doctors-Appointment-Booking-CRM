const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, deleteSchedule, getAllSchedules, toggleScheduleStatus, transferAppointment, getUpcomingSchedules, getDoneSchedules, getTransferredAppointments, retakeTransferredAppointment } = require('../controllers/schedule.controller');


router.post('/create', createSchedule);
router.put('/update/:scheduleId', updateSchedule);
router.delete('/delete/:scheduleId', deleteSchedule)
router.get('/', getAllSchedules)

router.put("/:scheduleId/status", toggleScheduleStatus);  // Toggle status (Done or Upcoming) / Not Available
router.put('/:scheduleId', transferAppointment);  // Route for transferring an appointment (update doctor or hospital)
router.get('/transferred', getTransferredAppointments);  // fetching transferred appointments


router.get('/upcoming-status', getUpcomingSchedules);  // Route to fetch all upcoming schedules
router.get('/done-status', getDoneSchedules);     // Route to fetch all done schedules

module.exports = router;
