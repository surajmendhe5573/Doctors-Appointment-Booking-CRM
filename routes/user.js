const express = require('express');
const { addUser, updateUser, deleteUser, getAllUsers, login, refreshAccessToken, logout, forgetPassword, resetPassword } = require('../controllers/user.controller');
const router = express.Router();
const authenticateToken= require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);


router.post('/add', addUser);
router.put('/update/:id', authenticateToken, updateUser);
router.delete('/delete/:id', authenticateToken, deleteUser);
router.get('/', getAllUsers);

router.post('/forget-password',forgetPassword);
router.post('/reset-password', resetPassword);


module.exports = router;