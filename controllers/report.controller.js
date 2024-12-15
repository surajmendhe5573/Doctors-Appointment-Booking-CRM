const Report = require('../models/report.model');
const Hospital = require('../models/hospital.model'); 

// Add a new report
exports.addReport = async (req, res) => {
    try {
        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

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
            dateTime,
            payment,
            paymentStatus,
        });

        await newReport.save();

        // Include hospital name in response
        res.status(201).json({
            message: 'Report added successfully',
            report: {
                _id: newReport._id,
                hospitalName: hospital.hospitalName, // Return hospital name instead of ID
                surgeryType: newReport.surgeryType,
                patientName: newReport.patientName,
                dateTime: newReport.dateTime,
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
        const { id } = req.params;
        const { hospitalName, ...updateData } = req.body;

        if (hospitalName) {
            // Find the hospital by name and update its ObjectId
            const hospital = await Hospital.findOne({ hospitalName });
            if (!hospital) {
                return res.status(404).json({ message: 'Hospital not found' });
            }
            updateData.hospital = hospital._id;
        }

        const updatedReport = await Report.findByIdAndUpdate(id, updateData, { new: true }).populate('hospital');

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Include hospital name in response
        res.status(200).json({
            message: 'Report updated successfully',
            report: {
                _id: updatedReport._id,
                hospitalName: updatedReport.hospital.hospitalName, // Return hospital name
                surgeryType: updatedReport.surgeryType,
                patientName: updatedReport.patientName,
                dateTime: updatedReport.dateTime,
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
        const { id } = req.params;

        const deletedReport = await Report.findByIdAndDelete(id);
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
};

// Fetch all reports
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('hospital'); // Populate hospital details

        // Format the response to include hospitalName instead of ID
        const formattedReports = reports.map((report) => ({
            _id: report._id,
            hospitalName: report.hospital.hospitalName, // Extract hospital name
            surgeryType: report.surgeryType,
            patientName: report.patientName,
            dateTime: report.dateTime,
            payment: report.payment,
            paymentStatus: report.paymentStatus,
        }));

        res.status(200).json({ reports: formattedReports });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};
