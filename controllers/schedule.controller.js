const User = require('../models/user.model');
const Hospital = require('../models/hospital.model');
const Schedule = require('../models/schedule.model');
const moment = require('moment');

exports.createSchedule = async (req, res) => {
    try {
        const { doctorId, hospitalName, patientName, surgeryType, startDateTime, endDateTime, day } = req.body;

        // Validate the start and end date/times
        if (!startDateTime || !endDateTime) {
            return res.status(400).json({ message: 'Start date/time and End date/time are required.' });
        }

        // Parse the provided startDateTime and endDateTime using moment.js
        const start = moment(startDateTime, 'D MMM, YYYY h:mm A');
        const end = moment(endDateTime, 'D MMM, YYYY h:mm A');

        // Check if the parsed date is valid
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date/time format provided. Use "1 Dec, 2024 9:00 AM" format.' });
        }

        // Convert to JavaScript Date objects for use in the Schedule model
        const startDate = start.toDate();
        const endDate = end.toDate();

        // Validate the derived day from startDateTime if it's not passed
        let derivedDay = day || start.toLocaleString('en-US', { weekday: 'long' }); // Use provided day or derive from startDateTime

        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(derivedDay)) {
            return res.status(400).json({ message: 'Invalid day provided. Must be Sunday to Saturday.' });
        }

        // Check if hospital exists
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found!' });
        }

        // Check if doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'Doctor') {
            return res.status(404).json({ message: 'Doctor not found!' });
        }

        // Create schedule
        const newSchedule = new Schedule({
            doctor: doctorId,
            hospital: hospital._id,
            patientName,
            surgeryType,
            day: derivedDay,  // Use the derived day (from request or calculated)
            startDateTime: startDate,
            endDateTime: endDate,
            status: 'Upcoming', // Default status
        });

        // Save the schedule
        const savedSchedule = await newSchedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(savedSchedule._id)
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response with formatted date/times
        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor.name,
            hospitalName: populatedSchedule.hospital.hospitalName,
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day, // Include day in response
            startDateTime: moment(populatedSchedule.startDateTime).format('D MMM, YYYY h:mm A'), // Format date
            endDateTime: moment(populatedSchedule.endDateTime).format('D MMM, YYYY h:mm A'), // Format date
            status: populatedSchedule.status,
        };

        res.status(201).json({
            message: 'Schedule created successfully',
            schedules: [response],
        });
    } catch (error) {
        console.error('Error creating schedule:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update Schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params; // The scheduleId from the URL parameter
        const { doctorId, hospitalName, patientName, surgeryType, startDateTime, endDateTime, day } = req.body;

        // Validate the start and end date/times
        if (!startDateTime || !endDateTime) {
            return res.status(400).json({ message: 'Start date/time and End date/time are required.' });
        }

        // Parse the provided startDateTime and endDateTime using moment.js
        const start = moment(startDateTime, 'D MMM, YYYY h:mm A');
        const end = moment(endDateTime, 'D MMM, YYYY h:mm A');

        // Check if the parsed date is valid
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date/time format provided. Use "1 Dec, 2024 9:00 AM" format.' });
        }

        // Convert to JavaScript Date objects for use in the Schedule model
        const startDate = start.toDate();
        const endDate = end.toDate();

        // Validate the derived day from startDateTime if it's not passed
        let derivedDay = day || start.toLocaleString('en-US', { weekday: 'long' }); // Use provided day or derive from startDateTime

        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(derivedDay)) {
            return res.status(400).json({ message: 'Invalid day provided. Must be Sunday to Saturday.' });
        }

        // Check if hospital exists
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found!' });
        }

        // Check if doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'Doctor') {
            return res.status(404).json({ message: 'Doctor not found!' });
        }

        // Find the existing schedule by ID
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        // Update the schedule with new values
        schedule.doctor = doctorId;
        schedule.hospital = hospital._id;
        schedule.patientName = patientName || schedule.patientName; // Keep existing if not updated
        schedule.surgeryType = surgeryType || schedule.surgeryType; // Keep existing if not updated
        schedule.day = derivedDay;
        schedule.startDateTime = startDate;
        schedule.endDateTime = endDate;
        // schedule.status = 'Updated'; // Update status

        // Save the updated schedule
        const updatedSchedule = await schedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(updatedSchedule._id)
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response with formatted date/times
        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor.name,
            hospitalName: populatedSchedule.hospital.hospitalName,
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day, // Include day in response
            startDateTime: moment(populatedSchedule.startDateTime).format('D MMM, YYYY h:mm A'), // Format date
            endDateTime: moment(populatedSchedule.endDateTime).format('D MMM, YYYY h:mm A'), // Format date
            status: populatedSchedule.status,
        };

        res.status(200).json({
            message: 'Schedule updated successfully',
            schedules: [response],
        });
    } catch (error) {
        console.error('Error updating schedule:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete Schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        // Check if the schedule exists
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        await Schedule.findByIdAndDelete(scheduleId);

        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Retrieve all schedules
exports.getAllSchedules = async (req, res) => {
    try {
        // Fetch all schedules from the database
        const schedules = await Schedule.find()
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // If no schedules found
        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found.' });
        }

        // Format the schedules response
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            doctorName: schedule.doctor.name,
            hospitalName: schedule.hospital.hospitalName,
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
            endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
            status: schedule.status,
        }));

        res.status(200).json({
            message: 'Schedules fetched successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching schedules:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update the status 
exports.toggleScheduleStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const updatedSchedule = await Schedule.findByIdAndUpdate(
        req.params.scheduleId,
        { status },
        { new: true }
      );
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.status(200).json({
        message: "Schedule status updated successfully",
        schedule: updatedSchedule,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// Transfer appointment (Update doctor or hospital)
exports.transferAppointment = async (req, res) => {
    try {
        const { doctorId, hospitalName } = req.body;

        let updates = {};

        
        if (doctorId) {
            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== 'Doctor') {
                return res.status(404).json({ message: 'Doctor not found!' });
            }
            updates.doctor = doctorId;
        }

        if (hospitalName) {
            const hospital = await Hospital.findOne({ hospitalName });
            if (!hospital) {
                return res.status(404).json({ message: 'Hospital not found!' });
            }
            updates.hospital = hospital._id;
        }

        const { scheduleId } = req.params; 

        // Find the existing schedule by ID
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        // Update the schedule with the new doctor or hospital
        schedule.doctor = updates.doctor || schedule.doctor;
        schedule.hospital = updates.hospital || schedule.hospital;
        schedule.isTransferred = true; // Mark as transferred

        // Save the updated schedule
        const updatedSchedule = await schedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(updatedSchedule._id)
            .populate('doctor', 'fullName') // Populate doctor's fullName (was 'name', now 'fullName')
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Log the populated data to debug
        console.log('Populated Schedule:', populatedSchedule);
        console.log('Doctor:', populatedSchedule.doctor); // Check if the doctor field is populated correctly

        // Format the response with formatted date/times
        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor?.fullName || 'N/A', // Use 'fullName' instead of 'name'
            hospitalName: populatedSchedule.hospital?.hospitalName || 'N/A',
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day, // Include day in response
            startDateTime: moment(populatedSchedule.startDateTime).format('D MMM, YYYY h:mm A'), // Format date
            endDateTime: moment(populatedSchedule.endDateTime).format('D MMM, YYYY h:mm A'), // Format date
            status: populatedSchedule.status,
        };

        res.status(200).json({
            message: 'Appointment transferred successfully',
            schedules: [response],
        });
    } catch (error) {
        console.error('Error transferring schedule:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Retrieve all upcoming schedules
exports.getUpcomingSchedules = async (req, res) => {
    try {
        // Retrieve all schedules with status 'Upcoming' and populate fields
        const schedules = await Schedule.find({ status: 'Upcoming' })
            .populate('doctor', 'fullName') // Populate doctor's fullName (was 'name', now 'fullName')
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            doctorName: schedule.doctor?.fullName || 'N/A', // Use 'fullName' instead of 'name'
            hospitalName: schedule.hospital?.hospitalName || 'N/A',
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            date: schedule.date,
            time: schedule.time,
            status: schedule.status,
        }));

        res.status(200).json({
            message: 'Upcoming schedules retrieved successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error retrieving upcoming schedules:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Retrieve all done schedules
exports.getDoneSchedules = async (req, res) => {
    try {
        // Retrieve all schedules with status 'Done' and populate fields
        const schedules = await Schedule.find({ status: 'Done' })
            .populate('doctor', 'fullName') // Populate doctor's fullName (was 'name', now 'fullName')
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            doctorName: schedule.doctor?.fullName || 'N/A', // Use 'fullName' instead of 'name'
            hospitalName: schedule.hospital?.hospitalName || 'N/A',
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            date: schedule.date,
            time: schedule.time,
            status: schedule.status,
        }));

        res.status(200).json({
            message: 'Done schedules retrieved successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error retrieving done schedules:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Retrieve transferred appointments (appointments that have been transferred)
exports.getTransferredAppointments = async (req, res) => {
    try {
        // Fetch schedules that have been transferred (isTransferred = true)
        const transferredSchedules = await Schedule.find({ isTransferred: true })
            .populate('doctor', 'fullName') // Populate doctor's full name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // If no transferred schedules found
        if (transferredSchedules.length === 0) {
            return res.status(404).json({ message: 'No transferred appointments found.' });
        }

        // Format the schedules response
        const formattedSchedules = transferredSchedules.map(schedule => ({
            _id: schedule._id,
            doctorName: schedule.doctor?.fullName || 'N/A',
            hospitalName: schedule.hospital?.hospitalName || 'N/A',
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
            endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
            status: schedule.status,
        }));

        res.status(200).json({
            message: 'Transferred appointments fetched successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching transferred appointments:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// API to retake a transferred appointment (set isTransferred to false)
exports.retakeTransferredAppointment = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        // Find the schedule by ID
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        // Check if the appointment has already been retaken (i.e., isTransferred is false)
        if (!schedule.isTransferred) {
            return res.status(400).json({ message: 'This appointment has not been transferred.' });
        }

        // Reset the isTransferred field to false
        schedule.isTransferred = false;

        // Save the updated schedule
        const updatedSchedule = await schedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(updatedSchedule._id)
            .populate('doctor', 'fullName') 
            .populate('hospital', 'hospitalName');

        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor?.fullName || 'N/A',
            hospitalName: populatedSchedule.hospital?.hospitalName || 'N/A',
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day,
            startDateTime: moment(populatedSchedule.startDateTime).format('D MMM, YYYY h:mm A'),
            endDateTime: moment(populatedSchedule.endDateTime).format('D MMM, YYYY h:mm A'),
            status: populatedSchedule.status,
        };

        res.status(200).json({
            message: 'Appointment retaken successfully',
            schedules: [response],
        });
    } catch (error) {
        console.error('Error retaking schedule:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
