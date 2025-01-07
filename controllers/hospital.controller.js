const Hospital = require('../models/hospital.model'); 
const ExcelJS= require('exceljs');

const addHospital = async (req, res) => {
    try {

        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;
        
        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingHospital = await Hospital.findOne({ hospitalEmailId });
        if (existingHospital) {
            return res.status(400).json({ message: 'Hospital with this email already exists.' });
        }

        const newHospital = new Hospital({
            hospitalName,
            hospitalEmailId,
            hospitalPhoneNo,
            adminFullName,
            adminPhoneNo,
        });

        await newHospital.save();

        return res.status(201).json({ message: 'Hospital added successfully.', hospital: newHospital });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

const updateHospital = async (req, res) => {
    try {

        const { id } = req.params;
        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;

        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const updatedHospital = await Hospital.findByIdAndUpdate(
            id,
            {
                hospitalName,
                hospitalEmailId,
                hospitalPhoneNo,
                adminFullName,
                adminPhoneNo,
            },
            { new: true } 
        );

        if (!updatedHospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        return res.status(200).json({ message: 'Hospital updated successfully.', hospital: updatedHospital });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

const deleteHospital = async (req, res) => {
  try {

      const { id } = req.params; 

      const deletedHospital = await Hospital.findByIdAndDelete(id);

      if (!deletedHospital) {
          return res.status(404).json({ message: 'Hospital not found.' });
      }

      return res.status(200).json({ message: 'Hospital deleted successfully.', hospital: deletedHospital });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};


const getAllHospitals = async (req, res) => {
    try {
        // Fetch all hospitals with the total payment amount of their schedules and the count of 'Done' schedules
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection in MongoDB
                    localField: '_id',  // The hospital's ID field
                    foreignField: 'hospital', // The 'hospital' field in the Schedule collection
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    totalSchedulePayment: { $sum: '$schedules.paymentAmount' }, // Total payment amount for all schedules
                    totalAmountReceived: { $sum: '$schedules.amountReceived' }, // Total received amount for all schedules
                    // Count the 'Done' schedules
                    doneScheduleCount: {
                        $size: {
                            $filter: {
                                input: '$schedules',
                                as: 'schedule',
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    // Calculate the remaining due amount
                    totalDueAmount: { $subtract: ['$totalSchedulePayment', '$totalAmountReceived'] },
                },
            },
            {
                $project: {
                    schedules: 0, // Exclude the schedules field from the response
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found.' });
        }

        return res.status(200).json({
            message: 'Hospitals retrieved successfully.',
            hospitals,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};


const exportHospitalsToExcel = async (req, res) => {
    try {
        // Fetch all hospitals with the doneScheduleCount
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection
                    localField: '_id',  // The hospital's ID
                    foreignField: 'hospital', // The 'hospital' field in the Schedule collection
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    // Count the 'Done' schedules
                    doneScheduleCount: {
                        $size: {
                            $filter: {
                                input: '$schedules',
                                as: 'schedule',
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0, // Exclude _id if not needed, or include 1 to keep it
                    hospitalName: 1,
                    hospitalEmailId: 1,
                    hospitalPhoneNo: 1,
                    adminFullName: 1,
                    adminPhoneNo: 1,
                    createdAt: 1,
                    doneScheduleCount: 1, // Include doneScheduleCount explicitly
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found to export.' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Hospitals');

        // Define columns for the worksheet
        worksheet.columns = [
            { header: 'Hospital Name', key: 'hospitalName', width: 30 },
            { header: 'Hospital Email ID', key: 'hospitalEmailId', width: 30 },
            { header: 'Hospital Phone No', key: 'hospitalPhoneNo', width: 20 },
            { header: 'Admin Full Name', key: 'adminFullName', width: 25 },
            { header: 'Admin Phone No', key: 'adminPhoneNo', width: 20 },
            { header: 'Done Schedule Count', key: 'doneScheduleCount', width: 25 },
            { header: 'Created At', key: 'createdAt', width: 25 },
        ];

        // Add rows to the worksheet
        hospitals.forEach((hospital) => {
            worksheet.addRow({
                hospitalName: hospital.hospitalName,
                hospitalEmailId: hospital.hospitalEmailId,
                hospitalPhoneNo: hospital.hospitalPhoneNo,
                adminFullName: hospital.adminFullName,
                adminPhoneNo: hospital.adminPhoneNo,
                doneScheduleCount: hospital.doneScheduleCount || 0,
                createdAt: hospital.createdAt ? hospital.createdAt.toISOString() : 'N/A',
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
        res.setHeader('Content-Disposition', 'attachment; filename=hospitals.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting hospitals to Excel:', error);
        res.status(500).json({ message: 'An error occurred while exporting data.', error: error.message });
    }
};



const getHospitalDoneSchedules = async (req, res) => {
    try {
        // Fetch hospitals and count the 'Done' schedules for each hospital
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection
                    localField: '_id', // The hospital's ID
                    foreignField: 'hospital', // The hospital field in the Schedule collection
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    // Count the 'Done' schedules
                    doneScheduleCount: {
                        $size: {
                            $filter: {
                                input: '$schedules',
                                as: 'schedule',
                                cond: { $eq: ['$$schedule.status', 'Done'] }, // Filter 'Done' schedules
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0, // Exclude _id if not needed, or include 1 to keep it
                    hospitalName: 1,
                    hospitalEmailId: 1,
                    hospitalPhoneNo: 1,
                    adminFullName: 1,
                    adminPhoneNo: 1,
                    createdAt: 1,
                    doneScheduleCount: 1, // Include doneScheduleCount explicitly
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found.' });
        }

        return res.status(200).json({
            message: 'Hospitals with Done schedules retrieved successfully.',
            hospitals,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};





module.exports = {
    addHospital,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    getHospitalDoneSchedules,
    exportHospitalsToExcel,
};
