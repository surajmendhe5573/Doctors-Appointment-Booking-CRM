const Report = require('../models/report.model');
const Hospital = require('../models/hospital.model');
const moment = require('moment-timezone');

// Utility function to parse formatted dateTime
const parseFormattedDateTime = (formattedDateTime) => {
    const [startTime, endTime] = formattedDateTime.split(' - ');
    const parsedStartTime = moment(startTime, 'D MMM,YYYY h:mm A');
    const parsedEndTime = moment(endTime, 'h:mm A');

    if (!parsedStartTime.isValid() || !parsedEndTime.isValid()) {
        throw new Error('Invalid date format');
    }

    return {
        startTime: parsedStartTime.toDate(),
        endTime: parsedEndTime.toDate(),
    };
};

// Add a new report
exports.addReport = async (req, res) => {
    try {
        // Check if the user has the role 'Doctor'
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

        // Parse the formatted dateTime
        const { startTime, endTime } = parseFormattedDateTime(dateTime);

        // Find the hospital by name
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Create a new report
        const newReport = new Report({
            hospital: hospital._id,
            surgeryType,
            patientName,
            startTime,
            endTime,
            payment,
            paymentStatus,
        });

        await newReport.save();

        res.status(201).json({
            message: 'Report added successfully',
            report: {
                _id: newReport._id,
                hospitalName: hospital.hospitalName,
                surgeryType: newReport.surgeryType,
                patientName: newReport.patientName,
                dateTime,
                payment: newReport.payment,
                paymentStatus: newReport.paymentStatus,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding report', error: error.message });
    }
};

// Update an existing report
exports.updateReport = async (req, res) => {
    try {

        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }
        
        const { reportId } = req.params;
        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

        // Parse the formatted dateTime if provided
        let parsedStartTime, parsedEndTime;
        if (dateTime) {
            const { startTime, endTime } = parseFormattedDateTime(dateTime); // Use the updated utility function
            parsedStartTime = startTime;
            parsedEndTime = endTime;
        }

        // Find the hospital by name
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Update fields for the report
        const updateFields = {
            hospital: hospital._id, // Update hospital reference
            surgeryType,
            patientName,
            payment,
            paymentStatus,
        };

        // Only add `startTime` and `endTime` if `dateTime` is provided
        if (parsedStartTime && parsedEndTime) {
            updateFields.startTime = parsedStartTime;
            updateFields.endTime = parsedEndTime;
        }

        // Find and update the report
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            updateFields,
            { new: true } // Return the updated report
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Return the updated report with formatted startTime and endTime
        res.status(200).json({
            message: 'Report updated successfully',
            report: {
                _id: updatedReport._id,
                hospitalName: hospital.hospitalName,
                surgeryType: updatedReport.surgeryType,
                patientName: updatedReport.patientName,
                dateTime: `${moment(updatedReport.startTime).format('D MMM,YYYY h:mm A')} - ${moment(updatedReport.endTime).format('h:mm A')}`, // Format startTime and endTime
                payment: updatedReport.payment,
                paymentStatus: updatedReport.paymentStatus,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
};


// Delete a report
exports.deleteReport = async (req, res) => {
    try {

        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const { reportId } = req.params; 

        const deletedReport = await Report.findByIdAndDelete(reportId);

        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({
            message: 'Report deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
};

// Fetch all reports
exports.fetchAllReports = async (req, res) => {
    try {
         // Check if the user has the role 'Doctor'
        //  if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const reports = await Report.find()
            .populate('hospital', 'hospitalName') 
            .exec();

        if (!reports.length) {
            return res.status(404).json({ message: 'No reports found' });
        }

        const formattedReports = reports.map((report) => {
            const formattedDateTime = `${moment(report.startTime).format('D MMM,YYYY h:mm A')} - ${moment(report.endTime).format('h:mm A')}`;

            return {
                _id: report._id,
                hospitalName: report.hospital.hospitalName,
                surgeryType: report.surgeryType,
                patientName: report.patientName,
                dateTime: formattedDateTime, 
                payment: report.payment,
                paymentStatus: report.paymentStatus,
            };
        });

        res.status(200).json({
            message: 'Reports fetched successfully',
            reports: formattedReports,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// Fetch reports by date range
exports.fetchReportsByDateRange = async (req, res) => {
    try {
        // Check if the user has the role 'Doctor'
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        // Parse the input dates
        const parsedStartDate = moment(startDate, 'YYYY-MM-DD').startOf('day');
        const parsedEndDate = moment(endDate, 'YYYY-MM-DD').endOf('day');

        if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Query to fetch reports within the date range
        const reports = await Report.find({
            startTime: {
                $gte: parsedStartDate.toDate(),
                $lte: parsedEndDate.toDate(),
            },
        })
            .populate('hospital', 'hospitalName') // Populate hospital name
            .exec();

        if (!reports.length) {
            return res.status(404).json({ message: 'No reports found within the specified date range' });
        }

        // Format the reports
        const formattedReports = reports.map((report) => {
            const formattedDateTime = `${moment(report.startTime).format('D MMM,YYYY h:mm A')} - ${moment(report.endTime).format('h:mm A')}`;
            return {
                _id: report._id,
                hospitalName: report.hospital.hospitalName,
                surgeryType: report.surgeryType,
                patientName: report.patientName,
                dateTime: formattedDateTime, // Formatted dateTime
                payment: report.payment,
                paymentStatus: report.paymentStatus,
            };
        });

        res.status(200).json({
            message: 'Reports fetched successfully',
            reports: formattedReports,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports by date range', error: error.message });
    }
};