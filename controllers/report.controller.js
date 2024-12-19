const Report = require('../models/report.model');
const Hospital = require('../models/hospital.model'); 
const moment = require('moment');

// Utility function to parse formatted dateTime
const parseFormattedDateTime = (formattedDateTime) => {
    // Example input: "1 Dec,2024 9:00 AM - 10:30 AM"
    const [datePart, timePart] = formattedDateTime.split(' - ')[0].split(' ');
    const startTime = `${datePart} ${timePart}`;

    const parsedDate = moment(startTime, 'D MMM,YYYY h:mm A');

    if (!parsedDate.isValid()) {
        throw new Error('Invalid date format');
    }

    return parsedDate.toDate(); 
};

// Add a new report
exports.addReport = async (req, res) => {
    try {
        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

        // Parse the formatted dateTime
        const parsedDateTime = parseFormattedDateTime(dateTime);

        // Find the hospital by name
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Create a new report
        const newReport = new Report({
            hospital: hospital._id, // Reference the hospital ObjectId
            surgeryType,
            patientName,
            dateTime: parsedDateTime, // Save as a Date object
            payment,
            paymentStatus,
        });

        await newReport.save();

        // Include hospital name in response
        res.status(201).json({
            message: 'Report added successfully',
            report: {
                _id: newReport._id,
                hospitalName: hospital.hospitalName,
                surgeryType: newReport.surgeryType,
                patientName: newReport.patientName,
                dateTime, // Return the original formatted dateTime
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
        const { reportId } = req.params; 
        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

        // Parse the formatted dateTime if provided
        let parsedDateTime;
        if (dateTime) {
            parsedDateTime = parseFormattedDateTime(dateTime); // Use the existing utility function
        }

        // Find the hospital by name
        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Find and update the report
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            {
                hospital: hospital._id, // Update hospital reference
                surgeryType,
                patientName,
                dateTime: parsedDateTime || undefined, // Only update if dateTime is provided
                payment,
                paymentStatus,
            },
            { new: true } // Return the updated report
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Return the updated report
        res.status(200).json({
            message: 'Report updated successfully',
            report: {
                _id: updatedReport._id,
                hospitalName: hospital.hospitalName,
                surgeryType: updatedReport.surgeryType,
                patientName: updatedReport.patientName,
                dateTime: moment(updatedReport.dateTime).format('D MMM,YYYY h:mm A'), // Format dateTime
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
        const reports = await Report.find()
            .populate('hospital', 'hospitalName') // Populate hospitalName from the Hospital collection
            .exec();

        if (!reports.length) {
            return res.status(404).json({ message: 'No reports found' });
        }

        // Format the reports to include hospital name in response
        const formattedReports = reports.map(report => ({
            _id: report._id,
            hospitalName: report.hospital.hospitalName, // Access populated hospital name
            surgeryType: report.surgeryType,
            patientName: report.patientName,
            dateTime: moment(report.dateTime).format('D MMM,YYYY h:mm A'), 
            payment: report.payment,
            paymentStatus: report.paymentStatus,
        }));

        res.status(200).json({
            message: 'Reports fetched successfully',
            reports: formattedReports,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};
