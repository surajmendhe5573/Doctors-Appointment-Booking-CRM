const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 

// Signup 
const signup = async (req, res) => {
    const { name, mobileNo, emailId, password, address, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            mobileNo,
            emailId,
            password: hashedPassword,
            address,
            role
        });

        await newUser.save();

        // Convert to plain object and exclude password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'User created successfully!', newUser:userResponse});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login 
const login = async (req, res) => {
    const { emailId, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Edit User Details
const editUserDetails = async (req, res) => {
    const { userId } = req.params; // Assuming the user ID is passed as a URL parameter
    const { name, mobileNo, emailId, address, role } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Update user details
        if (name) user.name = name;
        if (mobileNo) user.mobileNo = mobileNo;
        if (emailId) user.emailId = emailId;
        if (address) user.address = address;
        if (role) user.role = role;

        const updatedUser = await user.save();

        // Convert to plain object and exclude password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: 'User details updated successfully!',
            user: userResponse,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const { userId } = req.params; 
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        res.status(200).json({
            message: 'User deleted successfully!',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users
const getAllUsers= async(req, res)=>{
    try {
        const users= await User.find({}, '-password');  // Exclude the password field
        res.status(200).json({message: "Users retrieved successfully", users});
        
    } catch (error) {
        res.status(5000).json({message:"Internal server error"});
    }
}

module.exports = { signup, login, editUserDetails, deleteUser, getAllUsers };

