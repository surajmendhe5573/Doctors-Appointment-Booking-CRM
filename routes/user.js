const express = require('express');
const { signup, login, editUserDetails, deleteUser, getAllUsers } = require('../controllers/user.controller');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/edit/:userId', editUserDetails);
router.delete('/delete/:userId', deleteUser);
router.get('/', getAllUsers);

module.exports = router;
