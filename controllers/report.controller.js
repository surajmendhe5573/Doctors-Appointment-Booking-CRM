const Report = require('../models/report.model');
const Hospital = require('../models/hospital.model');
const moment = require('moment-timezone');
const ExcelJS= require('exceljs');

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

exports.addReport = async (req, res) => {
    try {
        // Check if the user has the role 'Doctor'
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const { hospitalName, surgeryType, patientName, dateTime, payment, paymentStatus } = req.body;

        // Parse the formatted dateTime
        const { startTime, endTime } = parseFormattedDateTime(dateTime);

        const hospital = await Hospital.findOne({ hospitalName });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

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
            hospital: hospital._id, 
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
            { new: true } 
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

exports.fetchAllReports = async (req, res) => {
    try {
        // Check if the user has the role 'Doctor' (uncomment this if needed)
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can fetch reports.' });
        // }

        const reports = await Report.find()
            .populate('hospital') // Populate entire hospital object
            .exec();

        if (!reports.length) {
            return res.status(404).json({ message: 'No reports found' });
        }

        const formattedReports = reports.map((report) => {
            // Check if hospital is present
            const hospitalName = report.hospital ? report.hospital.hospitalName : 'Unknown';

            const formattedDateTime = `${moment(report.startTime).format('D MMM,YYYY h:mm A')} - ${moment(report.endTime).format('h:mm A')}`;

            return {
                _id: report._id,
                hospitalName: hospitalName, // Use 'Unknown' if hospital is missing
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
        console.log(error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};


exports.fetchReportsByDateRange = async (req, res) => {
    try {
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
        res.status(500).json({ message: 'Error fetching reports by date range', error: error.message });
    }
};

// Export reports to Excel
exports.exportReportsToExcel = async (req, res) => {
    try {
        // Fetch all reports and populate hospital details
        const reports = await Report.find()
            .populate('hospital', 'hospitalName')
            .exec();

        if (!reports.length) {
            return res.status(404).json({ message: 'No reports found to export.' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reports');

        // Define columns for the worksheet
        worksheet.columns = [
            { header: 'Hospital Name', key: 'hospitalName', width: 30 },
            { header: 'Surgery Type', key: 'surgeryType', width: 20 },
            { header: 'Patient Name', key: 'patientName', width: 25 },
            { header: 'Date and Time', key: 'dateTime', width: 40 },
            { header: 'Payment', key: 'payment', width: 15 },
            { header: 'Payment Status', key: 'paymentStatus', width: 20 },
        ];

        // Add rows to the worksheet
        reports.forEach((report) => {
            const formattedDateTime = `${moment(report.startTime).format('D MMM, YYYY h:mm A')} - ${moment(report.endTime).format('h:mm A')}`;

            worksheet.addRow({
                hospitalName: report.hospital.hospitalName,
                surgeryType: report.surgeryType,
                patientName: report.patientName,
                dateTime: formattedDateTime,
                payment: report.payment,
                paymentStatus: report.paymentStatus,
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Auto-filter and freeze header row
        worksheet.autoFilter = {
            from: 'A1',
            to: worksheet.columns[worksheet.columns.length - 1].letter + '1',
        };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Write workbook to a buffer and send it as a response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting reports to Excel:', error);
        res.status(500).json({ message: 'An error occurred while exporting reports.', error: error.message });
    }
};
