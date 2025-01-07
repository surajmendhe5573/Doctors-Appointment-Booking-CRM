const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token:', decoded);  
        req.user = decoded;

        // Ensure that the role exists
        if (!req.user.role) {
            return res.status(400).json({ message: 'Invalid token: missing role' });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token', error: error.message });
    }
};

module.exports = authenticateToken;
