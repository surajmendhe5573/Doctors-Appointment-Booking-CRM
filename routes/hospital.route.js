const express= require('express');
const router= express.Router();
const { addHospital, updateHospital, deleteHospital, getAllHospitals }= require('../controllers/hospital.controller');

router.post('/add', addHospital);
router.put('/update/:id', updateHospital);
router.delete('/delete/:id', deleteHospital);
router.get('/', getAllHospitals);


module.exports= router;