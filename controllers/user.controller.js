const User = require('../models/user.model'); 

const addUser = async (req, res) => {
    try {
        const { fullName, emailId, phoneNo, address, role } = req.body;
        const userExist= await User.findOne({emailId});

        if(userExist){
            return res.status(400).json({ message: 'Email already exists.' });
        }

        if (!fullName || !emailId || !phoneNo || !address || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newUser = new User({
            fullName,
            emailId,
            phoneNo,
            address,
            role,
        });

        await newUser.save();

        return res.status(201).json({ message: 'User added successfully.', user: newUser });
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
        const users = await User.find();

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
    getAllUsers
};