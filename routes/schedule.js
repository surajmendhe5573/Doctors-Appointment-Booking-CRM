const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, deleteSchedule, getAllSchedules, 
      toggleScheduleStatus, transferAppointment, getUpcomingSchedules, 
      getDoneSchedules, getTransferredAppointments, retakeTransferredAppointment, 
      getSchedulesByDateRange, getTransferredAppointmentsByDateRange, updatePaymentDetails } = require('../controllers/schedule.controller');


router.post('/create', createSchedule);
router.put('/update/:scheduleId', updateSchedule);
router.delete('/delete/:scheduleId', deleteSchedule)
router.get('/', getAllSchedules)
router.get('/date-range', getSchedulesByDateRange); // fetch schedules date wise

router.put("/:scheduleId/status", toggleScheduleStatus);  // Toggle status (Done or Upcoming) / Not Available
router.put('/:scheduleId', transferAppointment);  // Route for transferring an appointment (update doctor or hospital)
router.get('/transferred', getTransferredAppointments);  // fetching transferred appointments
router.get('/transferred/date-range', getTransferredAppointmentsByDateRange);  // fetching transferred appointments by date range
router.put('/retake/:scheduleId', retakeTransferredAppointment);  // retake transferred appointments


router.get('/upcoming-status', getUpcomingSchedules);  // Route to fetch all upcoming schedules
router.get('/done-status', getDoneSchedules);     // Route to fetch all done schedules


router.put('/:scheduleId/payment', updatePaymentDetails);

module.exports = router;

