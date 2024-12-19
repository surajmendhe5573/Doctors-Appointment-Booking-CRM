const express = require('express');
const { addUser, updateUser, deleteUser, getAllUsers } = require('../controllers/user.controller');
const router = express.Router();

router.post('/add', addUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/', getAllUsers);

module.exports = router;
