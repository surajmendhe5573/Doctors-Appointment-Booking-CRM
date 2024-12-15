const Hospital = require('../models/hospital.model'); 

// Add a new hospital
const addHospital = async (req, res) => {
  const { hospitalName, adminPerson, emailId, surgeriesDone, totalPayment, paymentStatus } = req.body;

  try {
    const hospital = new Hospital({
        hospitalName,
        adminPerson,
        emailId,
        surgeriesDone,
        totalPayment,
        paymentStatus,
      });
    
    const savedHospital = await hospital.save();
    res.status(201).json(savedHospital);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "Internal server error"});
  }
};

// Update hospital details
const updateHospitalDetails = async (req, res) => {
    const { id } = req.params;
    const updates = req.body; // Expects an object with fields to update
  
    try {
      const updatedHospital = await Hospital.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  
      if (!updatedHospital) {
        return res.status(404).json({ message: 'Hospital not found!' });
      }
  
      res.status(200).json({
        message: 'Hospital details updated successfully',
        hospital: updatedHospital,
      });
    } catch (error) {
      console.log('Error updating hospital:', error.message);
      res.status(500).json({ message: "Internal server error", details: error.message });
    }
  };

// Delete a hospital
const deleteHospital = async (req, res) => {
  const { id } = req.params;

  try {
    const hospital=  await Hospital.findByIdAndDelete(id);

    if (!hospital) {
        return res.status(404).json({ message: 'hospital not found!' });
    }

    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({message: "Internal server error"});
  }
};

// Retrieved hospitals
const fetchAllHospitals= async(req, res)=>{
    try {
        const hospitals= await Hospital.find();
        res.status(200).json({message: "Hospitals retrieved successfully", hospitals});
        
    } catch (error) {
        res.status(500).json({message: "Internal server error"})
    }
}

module.exports= {addHospital, updateHospitalDetails, deleteHospital, fetchAllHospitals};