const User = require('../models/user.model');
const Hospital = require('../models/hospital.model');
const Schedule = require('../models/schedule.model');

exports.createSchedule = async (req, res) => {
    try {
        const { doctorId, hospitalName, patientName, surgeryType, day, date, time } = req.body;

        // Validate the day
        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(day)) {
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
            day,
            date,
            time
        });

        // Save the schedule
        const savedSchedule = await newSchedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(savedSchedule._id)
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response
        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor.name,
            hospitalName: populatedSchedule.hospital.hospitalName,
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day,
            date: populatedSchedule.date,
            time: populatedSchedule.time,
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
        const { scheduleId } = req.params;
        const { doctorId, hospitalName, patientName, surgeryType, day, date, time } = req.body;

        // Validate the day
        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (day && !validDays.includes(day)) {
            return res.status(400).json({ message: 'Invalid day provided. Must be Sunday to Saturday.' });
        }

        // Check if hospital exists if hospitalName is being updated
        let hospital;
        if (hospitalName) {
            hospital = await Hospital.findOne({ hospitalName });
            if (!hospital) {
                return res.status(404).json({ message: 'Hospital not found!' });
            }
        }

        // Check if doctor exists if doctorId is being updated
        let doctor;
        if (doctorId) {
            doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== 'Doctor') {
                return res.status(404).json({ message: 'Doctor not found!' });
            }
        }

        // Update the schedule
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            scheduleId,
            {
                ...(doctorId && { doctor: doctorId }),
                ...(hospital && { hospital: hospital._id }),
                ...(patientName && { patientName }),
                ...(surgeryType && { surgeryType }),
                ...(day && { day }),
                ...(date && { date }),
                ...(time && { time }),
            },
            { new: true } // Return the updated document
        )
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        // Format the response
        const response = {
            _id: updatedSchedule._id,
            doctorName: updatedSchedule.doctor.name,
            hospitalName: updatedSchedule.hospital.hospitalName,
            patientName: updatedSchedule.patientName,
            surgeryType: updatedSchedule.surgeryType,
            day: updatedSchedule.day,
            date: updatedSchedule.date,
            time: updatedSchedule.time,
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

        // Delete the schedule
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
        // Retrieve all schedules and populate fields
        const schedules = await Schedule.find()
            .populate('doctor', 'name') // Populate doctor's name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // Format the response
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            doctorName: schedule.doctor.name,
            hospitalName: schedule.hospital.hospitalName,
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            date: schedule.date,
            time: schedule.time,
        }));

        res.status(200).json({
            message: 'Schedules retrieved successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error retrieving schedules:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

