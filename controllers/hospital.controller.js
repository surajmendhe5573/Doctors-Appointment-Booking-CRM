const Hospital = require('../models/hospital.model'); 

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

// Fetch all hospitals
const getAllHospitals = async (req, res) => {
  try {
      // Retrieve all hospitals from the database
      const hospitals = await Hospital.find();

      if (!hospitals.length) {
          return res.status(404).json({ message: 'No hospitals found.' });
      }

      return res.status(200).json({ message: 'Hospitals retrieved successfully.', hospitals });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};


module.exports = {
    addHospital,
    updateHospital,
    deleteHospital,
    getAllHospitals
};
