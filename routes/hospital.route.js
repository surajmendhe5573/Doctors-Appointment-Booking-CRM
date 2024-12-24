const express= require('express');
const router= express.Router();
const { addHospital, updateHospital, deleteHospital, getAllHospitals }= require('../controllers/hospital.controller');
const authenticateToken= require('../middleware/auth.middleware');

router.post('/add', authenticateToken, addHospital);
router.put('/update/:id', authenticateToken, updateHospital);
router.delete('/delete/:id', authenticateToken, deleteHospital);
router.get('/', authenticateToken, getAllHospitals);


module.exports= router;