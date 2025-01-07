const User = require('../models/user.model');
const Hospital = require('../models/hospital.model');
const Schedule = require('../models/schedule.model');
const moment = require('moment');
const ExcelJS= require('exceljs');

exports.createSchedule = async (req, res) => {
    try {
        const { doctorId, hospitalName, patientName, surgeryType, startDateTime, endDateTime, day, paymentAmount, paymentStatus } = req.body;

        if (!startDateTime || !endDateTime) {
            return res.status(400).json({ message: 'Start date/time and End date/time are required.' });
        }

        const start = moment(startDateTime, 'D MMM, YYYY h:mm A');
        const end = moment(endDateTime, 'D MMM, YYYY h:mm A');

        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date/time format provided. Use "1 Dec, 2024 9:00 AM" format.' });
        }

        const startDate = start.toDate();
        const endDate = end.toDate();

        // Validate the derived day from startDateTime if it's not passed
        let derivedDay = day || start.toLocaleString('en-US', { weekday: 'long' }); 

        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(derivedDay)) {
            return res.status(400).json({ message: 'Invalid day provided. Must be Sunday to Saturday.' });
        }

        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found!' });
        }

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
            status: 'Upcoming',
            paymentAmount,
            paymentStatus
        });

        const savedSchedule = await newSchedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(savedSchedule._id)
            .populate('doctor', 'name') 
            .populate('hospital', 'hospitalName'); 

        // Format the response with formatted date/times
        const response = {
            _id: populatedSchedule._id,
            doctorName: populatedSchedule.doctor.name,
            hospitalName: populatedSchedule.hospital.hospitalName,
            patientName: populatedSchedule.patientName,
            surgeryType: populatedSchedule.surgeryType,
            day: populatedSchedule.day, // Include day in response
            startDateTime: moment(populatedSchedule.startDateTime).format('D MMM, YYYY h:mm A'), 
            endDateTime: moment(populatedSchedule.endDateTime).format('D MMM, YYYY h:mm A'),
            status: populatedSchedule.status,
            paymentAmount: populatedSchedule.paymentAmount,
            paymentStatus: populatedSchedule.paymentStatus,
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
        // Fetch all schedules from the database and populate doctor and hospital
        const schedules = await Schedule.find()
            .populate('doctor', 'fullName') // Populate doctor's fullName
            .populate('hospital', 'hospitalName'); // Populate hospital's hospitalName

        // If no schedules found
        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found.' });
        }

        // Format the schedules response
        const formattedSchedules = schedules.map(schedule => {
            // Ensure doctor and hospital are populated correctly
            const doctorName = schedule.doctor ? schedule.doctor.fullName : 'No doctor assigned';
            const hospitalName = schedule.hospital ? schedule.hospital.hospitalName : 'No hospital assigned';

            // Calculate the due amount
            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);
            const paymentStatus = dueAmount <= 0 ? 'Done' : 'Pending';

            // Return the formatted schedule with the additional fields
            return {
                _id: schedule._id,
                doctorName: doctorName, // Include doctor name in response
                hospitalName: hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus: paymentStatus,
                amountReceived: schedule.amountReceived,
                dueAmount: dueAmount > 0 ? dueAmount : 0, // Ensure due amount is not negative
                paymentMethod: schedule.paymentMethod || 'N/A', // Fallback to 'N/A' if not present
                documentProofNo: schedule.documentProofNo || 'N/A', // Fallback to 'N/A' if not present
            };
        });

        res.status(200).json({
            message: 'Schedules fetched successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error(error);
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

// Re-Take Transferred Appointment (Revert to the original or reassign)
exports.retakeTransferredAppointment = async (req, res) => {
    try {
        const { doctorId, hospitalName } = req.body;
        const { scheduleId } = req.params; 

        // Initialize an object to hold updates
        let updates = {};

        // Fetch the existing schedule to check the status
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        if (!schedule.isTransferred) {
            return res.status(400).json({ message: 'This appointment has not been transferred.' });
        }

        // If doctorId is provided, validate and update the doctor
        if (doctorId) {
            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== 'Doctor') {
                return res.status(404).json({ message: 'Doctor not found!' });
            }
            updates.doctor = doctorId;
        }

        // If hospitalName is provided, validate and update the hospital
        if (hospitalName) {
            const hospital = await Hospital.findOne({ hospitalName });
            if (!hospital) {
                return res.status(404).json({ message: 'Hospital not found!' });
            }
            updates.hospital = hospital._id;
        }

        // If no updates are provided (no doctor or hospital), revert to the original
        if (!doctorId && !hospitalName) {
            updates.doctor = schedule.originalDoctor;
            updates.hospital = schedule.originalHospital;
        }

        // Update the schedule with the new details
        schedule.doctor = updates.doctor || schedule.doctor;
        schedule.hospital = updates.hospital || schedule.hospital;
        schedule.isTransferred = false; // Mark as no longer transferred

        // Save the updated schedule
        const updatedSchedule = await schedule.save();

        // Populate doctor and hospital fields for the response
        const populatedSchedule = await Schedule.findById(updatedSchedule._id)
            .populate('doctor', 'fullName')
            .populate('hospital', 'hospitalName');

        // Format the response with formatted date/times
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
            message: 'Appointment re-taken successfully',
            schedules: [response],
        });
    } catch (error) {
        console.error('Error re-taking transferred appointment:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Fetch Schedules within a date range
exports.getSchedulesByDateRange = async (req, res) => {
    try {
        // Extract start and end dates from query parameters
        const { startDate, endDate } = req.query;

        // Validate the start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and End date are required.' });
        }

        // Parse the provided startDate and endDate using moment.js in 'YYYY-MM-DD' format
        const start = moment.utc(startDate, 'YYYY-MM-DD'); // Use UTC to handle any time zone issues
        const end = moment.utc(endDate, 'YYYY-MM-DD'); // Use UTC to handle any time zone issues

        // Check if the parsed dates are valid
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Use "YYYY-MM-DD" format.' });
        }

        console.log('Parsed Start Date:', start.format());  // Log for debugging
        console.log('Parsed End Date:', end.format());      // Log for debugging

        // Fetch schedules that fall within the start and end date range, including overlapping ones
        const schedules = await Schedule.find({
            $or: [
                { startDateTime: { $gte: start.toDate(), $lte: end.toDate() } },  // Schedules starting within the range
                { endDateTime: { $gte: start.toDate(), $lte: end.toDate() } },    // Schedules ending within the range
                { startDateTime: { $lte: start.toDate() }, endDateTime: { $gte: end.toDate() } } // Schedules fully within the range
            ]
        })
        .populate('doctor', 'fullName') // Populate doctor's full name
        .populate('hospital', 'hospitalName'); // Populate hospital's name

        // If no schedules found within the range
        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found within the specified date range.' });
        }

        // Format the schedules response to match the required structure
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            doctorName: `Dr. ${schedule.doctor?.fullName || 'N/A'}`, // Prefix 'Dr.' to the doctor's name
            hospitalName: schedule.hospital?.hospitalName || 'N/A',
            patientName: schedule.patientName,
            surgeryType: schedule.surgeryType,
            day: schedule.day,
            startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
            endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
            status: schedule.status,
            paymentAmount: schedule.paymentAmount || 0,  // Assuming you have this field in the model
            paymentStatus: schedule.paymentStatus || 'Pending', // Default to 'Pending' if not provided
            amountReceived: schedule.amountReceived || 0, // Assuming you have this field in the model
            dueAmount: (schedule.paymentAmount || 0) - (schedule.amountReceived || 0), // Calculate due amount
            paymentMethod: schedule.paymentMethod || 'N/A', // Default to 'N/A' if not provided
            documentProofNo: schedule.documentProofNo || 'N/A' // Default to 'N/A' if not provided
        }));

        res.status(200).json({
            message: 'Schedules fetched successfully',
            schedules: formattedSchedules,
        });
    } catch (error) {
        console.error('Error fetching schedules by date range:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Retrieve transferred appointments within a date range
exports.getTransferredAppointmentsByDateRange = async (req, res) => {
    try {
        // Extract start and end dates from query parameters
        const { startDate, endDate } = req.query;

        // Validate the start and end dates
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and End date are required.' });
        }

        // Parse the provided startDate and endDate using moment.js in 'YYYY-MM-DD' format
        const start = moment(startDate, 'YYYY-MM-DD');
        const end = moment(endDate, 'YYYY-MM-DD');

        // Check if the parsed dates are valid
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Use "YYYY-MM-DD" format.' });
        }

        // Fetch transferred appointments within the given date range
        const transferredSchedules = await Schedule.find({
            isTransferred: true,
            startDateTime: { $gte: start.toDate() }, // Greater than or equal to start date
            endDateTime: { $lte: end.toDate() }, // Less than or equal to end date
        })
            .populate('doctor', 'fullName') // Populate doctor's full name
            .populate('hospital', 'hospitalName'); // Populate hospital's name

        // If no transferred schedules found
        if (transferredSchedules.length === 0) {
            return res.status(404).json({ message: 'No transferred appointments found within the specified date range.' });
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


// // update payment details
// exports.updatePaymentDetails = async (req, res) => {
//     try {
//         const { scheduleId } = req.params;
//         const { amountReceived, paymentMethod, documentProofNo } = req.body;

//         // Validate the inputs
//         if (!amountReceived || !paymentMethod || !documentProofNo) {
//             return res.status(400).json({ 
//                 message: 'Amount received, payment method, and document proof number are required.' 
//             });
//         }

//         // Ensure amountReceived is a valid number
//         const amountReceivedNum = Number(amountReceived);
//         if (isNaN(amountReceivedNum) || amountReceivedNum <= 0) {
//             return res.status(400).json({ message: 'Invalid amount received. Must be a positive number.' });
//         }

//         // Find the schedule by ID
//         const schedule = await Schedule.findById(scheduleId);
//         if (!schedule) {
//             return res.status(404).json({ message: 'Schedule not found!' });
//         }

//         // Calculate the new amount received
//         const newAmountReceived = (schedule.amountReceived || 0) + amountReceivedNum; // Safe increment
//         schedule.amountReceived = newAmountReceived; // Update the amountReceived field

//         // Update the other fields
//         schedule.paymentMethod = paymentMethod;
//         schedule.documentProofNo = documentProofNo;

//         // Calculate the due amount
//         const dueAmount = schedule.paymentAmount - newAmountReceived;

//         // Update paymentStatus based on the due amount
//         if (dueAmount <= 0) {
//             schedule.paymentStatus = 'Done';
//         } else {
//             schedule.paymentStatus = 'Pending';
//         }

//         // Save the updated schedule
//         const updatedSchedule = await schedule.save();

//         // Format the response
//         const response = {
//             _id: updatedSchedule._id,
//             patientName: updatedSchedule.patientName,
//             surgeryType: updatedSchedule.surgeryType,
//             paymentAmount: updatedSchedule.paymentAmount,
//             amountReceived: updatedSchedule.amountReceived,
//             dueAmount: dueAmount > 0 ? dueAmount : 0, // Ensure due amount is not negative
//             paymentMethod: updatedSchedule.paymentMethod,
//             documentProofNo: updatedSchedule.documentProofNo,
//             paymentStatus: updatedSchedule.paymentStatus,
//         };

//         res.status(200).json({
//             message: 'Payment details updated successfully',
//             schedule: response,
//         });
//     } catch (error) {
//         console.error('Error updating payment details:', error.message);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };



// update payment details
exports.updatePaymentDetails = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { amountReceived, paymentMethod, documentProofNo } = req.body;

        // Validate the inputs
        if (!amountReceived || !paymentMethod || !documentProofNo) {
            return res.status(400).json({ message: 'Amount received, payment method, and document proof number are required.' });
        }

        // Ensure amountReceived is a valid number
        const amountReceivedNum = Number(amountReceived);
        if (isNaN(amountReceivedNum) || amountReceivedNum <= 0) {
            return res.status(400).json({ message: 'Invalid amount received. Must be a positive number.' });
        }

        // Find the schedule by ID
        const schedule = await Schedule.findById(scheduleId).populate('hospital');
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found!' });
        }

        // Calculate the new amount received
        const newAmountReceived = (schedule.amountReceived || 0) + amountReceivedNum;
        schedule.amountReceived = newAmountReceived;

        // Update the other fields
        schedule.paymentMethod = paymentMethod;
        schedule.documentProofNo = documentProofNo;

        // Calculate the due amount
        const dueAmount = schedule.paymentAmount - newAmountReceived;

        // Update paymentStatus based on the due amount
        if (dueAmount <= 0) {
            schedule.paymentStatus = 'Done';
        } else {
            schedule.paymentStatus = 'Pending';
        }

        // Save the updated schedule
        const updatedSchedule = await schedule.save();

        // Update the hospital's total payment and due amount
        const hospital = schedule.hospital;
        hospital.totalSchedulePayment += amountReceivedNum;  // Increment the total schedule payment
        hospital.totalDueAmount = hospital.totalSchedulePayment - hospital.totalSchedulePayment;  // Adjust the total due amount
        await hospital.save();

        // Format the response
        const response = {
            _id: updatedSchedule._id,
            patientName: updatedSchedule.patientName,
            surgeryType: updatedSchedule.surgeryType,
            paymentAmount: updatedSchedule.paymentAmount,
            amountReceived: updatedSchedule.amountReceived,
            dueAmount: dueAmount > 0 ? dueAmount : 0,
            paymentMethod: updatedSchedule.paymentMethod,
            documentProofNo: updatedSchedule.documentProofNo,
            paymentStatus: updatedSchedule.paymentStatus,
        };

        res.status(200).json({
            message: 'Payment details updated successfully',
            schedule: response,
        });
    } catch (error) {
        console.error('Error updating payment details:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};




exports.exportSchedulesToExcel = async (req, res) => {
    try {
        // Fetch all schedules from the database and populate doctor and hospital
        const schedules = await Schedule.find()
            .populate('doctor', 'fullName') // Populate doctor's fullName
            .populate('hospital', 'hospitalName'); // Populate hospital's hospitalName

        if (schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found.' });
        }

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Schedules');

        // Define the headers for the Excel sheet
        worksheet.columns = [
            // { header: 'Schedule ID', key: '_id', width: 30 },
            { header: 'Doctor Name', key: 'doctorName', width: 30 },
            { header: 'Hospital Name', key: 'hospitalName', width: 30 },
            { header: 'Patient Name', key: 'patientName', width: 30 },
            { header: 'Surgery Type', key: 'surgeryType', width: 20 },
            { header: 'Day', key: 'day', width: 15 },
            { header: 'Start Date/Time', key: 'startDateTime', width: 25 },
            { header: 'End Date/Time', key: 'endDateTime', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment Amount', key: 'paymentAmount', width: 20 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 },
            { header: 'Amount Received', key: 'amountReceived', width: 20 },
            { header: 'Due Amount', key: 'dueAmount', width: 20 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 },
            { header: 'Document Proof No.', key: 'documentProofNo', width: 20 },
        ];

        // Populate rows with schedule data
        schedules.forEach(schedule => {
            const doctorName = schedule.doctor ? schedule.doctor.fullName : 'No doctor assigned';
            const hospitalName = schedule.hospital ? schedule.hospital.hospitalName : 'No hospital assigned';
            const dueAmount = schedule.paymentAmount - (schedule.amountReceived || 0);

            worksheet.addRow({
                // _id: schedule._id,
                doctorName: doctorName,
                hospitalName: hospitalName,
                patientName: schedule.patientName,
                surgeryType: schedule.surgeryType,
                day: schedule.day,
                startDateTime: moment(schedule.startDateTime).format('D MMM, YYYY h:mm A'),
                endDateTime: moment(schedule.endDateTime).format('D MMM, YYYY h:mm A'),
                status: schedule.status,
                paymentAmount: schedule.paymentAmount,
                paymentStatus: schedule.paymentStatus,
                amountReceived: schedule.amountReceived,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paymentMethod: schedule.paymentMethod || 'N/A',
                documentProofNo: schedule.documentProofNo || 'N/A',
            });
        });

        // Set the response header to indicate an Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=schedules.xlsx');

        // Write the Excel file to the response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting schedules to Excel:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};