const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }

        const userExist = await User.findOne({ emailId });
        if (!userExist) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.error('JWT secrets are not defined');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Generate tokens
        const accessToken = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ id: userExist._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Save refreshToken to the database without full validation
        await User.updateOne({ _id: userExist._id }, { refreshToken });

        // Respond with user details and tokens
        res.status(200).json({
            message: 'User signed in successfully',
            accessToken,
            refreshToken,
            user: {
                fullName: userExist.fullName,
                emailId: userExist.emailId,
                role: userExist.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Refresh Token Endpoint
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const user = await User.findById(decoded.id);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Generate new access token
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
            res.status(200).json({ accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required for logout' });
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const user = await User.findById(decoded.id);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Invalidate the refresh token
            await User.updateOne({ _id: user._id }, { $unset: { refreshToken: '' } });

            res.status(200).json({ message: 'User logged out successfully' });
        });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};




const addUser = async (req, res) => {
    try {
        const { fullName, emailId, password, phoneNo, address, role } = req.body;
        const userExist= await User.findOne({emailId});

        if(userExist){
            return res.status(409).json({ message: 'Email already exists.' });
        }

        if (!fullName || !emailId || !phoneNo || !address || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const hashedPassword= await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            emailId,
            password: hashedPassword,
            phoneNo,
            address,
            role,
        });

        await newUser.save();

        return res.status(201).json({ message: 'User added successfully.', user: {fullName, emailId, phoneNo, address, role} });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Update an existing user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // User ID from URL params
        const { fullName, emailId, phoneNo, address, role } = req.body;

        // Validate required fields
        if (!fullName || !emailId || !phoneNo || !address || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find user by ID and update
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { fullName, emailId, phoneNo, address, role },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // User ID from URL params

        // Find user by ID and delete
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'User deleted successfully.', user: deletedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// Retrieve all users
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({}, '-password');

        // Check if users exist
        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        return res.status(200).json({ message: 'Users retrieved successfully.', users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

module.exports = {
    addUser,
    updateUser,
    deleteUser,
    getAllUsers,
    login,
    refreshAccessToken,
    logout
};