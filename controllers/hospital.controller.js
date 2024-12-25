const Hospital = require('../models/hospital.model'); 
const ExcelJS= require('exceljs');

// Add a new hospital
const addHospital = async (req, res) => {
    try {

        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;
        
        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the hospital already exists (based on email)
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

// Update an existing hospital
const updateHospital = async (req, res) => {
    try {

        // // Check if the user has the role 'Doctor'
        // if (req.user.role !== 'Doctor') {
        //     return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
        // }

        const { id } = req.params;
        const { hospitalName, hospitalEmailId, hospitalPhoneNo, adminFullName, adminPhoneNo } = req.body;

        if (!hospitalName || !hospitalEmailId || !hospitalPhoneNo || !adminFullName || !adminPhoneNo) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find hospital by ID and update
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

// Delete a hospital
const deleteHospital = async (req, res) => {
  try {

    
    //  // Check if the user has the role 'Doctor'
    // if (req.user.role !== 'Doctor') {
    //         return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
    // }

      const { id } = req.params; // Hospital ID from the URL

      // Find and delete the hospital by ID
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

// // Fetch all hospitals
// const getAllHospitals = async (req, res) => {
//   try {

//     //      // Check if the user has the role 'Doctor'
//     //      if (req.user.role !== 'Doctor') {
//     //         return res.status(403).json({ message: 'Access Denied. Only doctors can add reports.' });
//     // }
    
//       // Retrieve all hospitals from the database
//       const hospitals = await Hospital.find();

//       if (!hospitals.length) {
//           return res.status(404).json({ message: 'No hospitals found.' });
//       }

//       return res.status(200).json({ message: 'Hospitals retrieved successfully.', hospitals });
//   } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: 'An error occurred.', error: error.message });
//   }
// };


const exportHospitalsToExcel = async (req, res) => {
    try {
        // Fetch all hospitals
        const hospitals = await Hospital.find();

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
            { header: 'Admin Full Name', key: 'adminFullName', width: 20 },
            { header: 'Admin Phone No', key: 'adminPhoneNo', width: 20 },
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
                createdAt: hospital.createdAt ? hospital.createdAt.toISOString() : 'N/A',
            });
        });

        // Format the header row
        worksheet.getRow(1).font = { bold: true };

        // Write workbook to a buffer and send it as a response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=hospitals.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred while exporting data.', error: error.message });
    }
};

// Fetch all hospitals with total payment amount
const getAllHospitals = async (req, res) => {
    try {
        // Fetch all hospitals with the total payment amount of their schedules
        const hospitals = await Hospital.aggregate([
            {
                $lookup: {
                    from: 'schedules', // Name of the Schedule collection in MongoDB
                    localField: '_id',
                    foreignField: 'hospital',
                    as: 'schedules',
                },
            },
            {
                $addFields: {
                    totalSchedulePayment: { $sum: '$schedules.paymentAmount' },
                },
            },
            {
                $project: {
                    schedules: 0, // Exclude schedules array from the result
                },
            },
        ]);

        if (!hospitals.length) {
            return res.status(404).json({ message: 'No hospitals found.' });
        }

        return res.status(200).json({ message: 'Hospitals retrieved successfully.', hospitals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

module.exports = {
    getAllHospitals,
};

module.exports = {
    addHospital,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    exportHospitalsToExcel,
};
