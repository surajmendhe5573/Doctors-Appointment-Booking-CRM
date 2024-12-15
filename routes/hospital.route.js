const express= require('express');
const router= express.Router();
const { addHospital, deleteHospital, fetchAllHospitals, updateHospitalDetails }= require('../controllers/hospital.controller');

router.post('/', addHospital);
router.put('/update/:id', updateHospitalDetails);
router.delete('/delete/:id', deleteHospital);
router.get('/', fetchAllHospitals);


module.exports= router;