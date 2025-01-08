const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const upload= require('../utils/upload');
const moment = require('moment');
const redis= require('../utils/redisClient');
require('dotenv').config();

const addUser = async (req, res) => {
    try {
        upload.single('photo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const { fullName, emailId, password, phoneNo, address, role } = req.body;

            const userExist = await User.findOne({ emailId });

            if (userExist) {
                return res.status(409).json({ message: 'Email already exists.' });
            }

            if (!fullName || !emailId || !phoneNo || !address || !role) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const photoUrl = req.file ? `/uploads/${req.file.filename}` : null; 

            const newUser = new User({
                fullName,
                emailId,
                password: hashedPassword,
                phoneNo,
                address,
                role,
                photo: photoUrl,  
            });

            await newUser.save();

            return res.status(201).json({
                message: 'User added successfully.',
                user: { fullName, emailId, phoneNo, address, role, photo: photoUrl }
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

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

        const accessToken = jwt.sign(
            { id: userExist._id, role: userExist.role },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { id: userExist._id, role: userExist.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Get the previous lastLogin time
        const previousLastLogin = userExist.lastLogin;

        // Update lastLogin time to current time
        const currentTime = new Date();
        await User.updateOne(
            { _id: userExist._id },
            { lastLogin: currentTime, refreshToken }
        );

        const formattedLastLogin = previousLastLogin
            ? moment(previousLastLogin).format('hh:mm A, MMMM D, YYYY') // Previous login time
            : moment(currentTime).format('hh:mm A, MMMM D, YYYY'); // First login or new time

        res.status(200).json({
            message: 'User signed in successfully',
            accessToken,
            refreshToken,
            user: {
                fullName: userExist.fullName,
                emailId: userExist.emailId,
                role: userExist.role,
                photo: userExist.photo,
                lastLogin: formattedLastLogin 
            }
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

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

const updateUser = async (req, res) => {
    try {
        upload.single('photo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const {id}= req.params;
            const { fullName, emailId, password, phoneNo, address, role } = req.body;

           // Allow users to update their own details or allow admins to update any user
           if(req.user.role !== 'Admin' && req.user.id !== id) {
                  return res.status(403).json({ message: 'You are not authorized to update this user' });
                }

            const updates= {};

            if (fullName) updates.fullName = fullName;
            if (phoneNo) updates.phoneNo = phoneNo;
            if (address) updates.address = address;
            if(role) updates.role= role

            if(emailId){
                const userExist= await User.findOne({emailId});
                if(userExist && userExist._id.toString() !== id){
                    return res.status(409).json({message: 'Email is already taken by another user'});
                }
                updates.emailId= emailId;
            }

            if(password){
                const hashedPassword= await bcrypt.hash(password, 10);
                updates.password= hashedPassword;
            }

            if (req.file) {
                updates.photo = `/uploads/${req.file.filename}`;
            }

            const updateUser= await User.findByIdAndUpdate(id, updates, {new:true});
            if(!updateUser){
                return res.status(404).json({message: 'User not found'});
            }

            return res.status(200).json({
                message: 'User updated successfully', user:updateUser});
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
         
        // Allow admins to delete any user and users to update their own details  
        if(req.user.role !== 'Admin' && req.user.id !== id) {
            return res.status(403).json({ message: 'You are not authorized to update this user' });
        }
        
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


// const getAllUsers = async (req, res) => {
//     try {

//         // Allow admins to fetch all users
//         if(req.user.role !== 'Admin') {
//             return res.status(403).json({ message: 'You are not authorized to update this user' });
//         }

//         const users = await User.find({}, '-password');

//         if (!users.length) {
//             return res.status(404).json({ message: 'No users found.' });
//         }

//         return res.status(200).json({ message: 'Users retrieved successfully.', users });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: 'An error occurred.', error: error.message });
//     }
// };

const getAllUsers = async (req, res) => {
    try {
        // Ensure only Admin can fetch all users
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'You are not authorized to fetch users.' });
        }

        // Check Redis cache
        const cachedUsers = await redis.get('all_users');
        if (cachedUsers) {
            console.log('Cache hit - returning users from Redis');
            return res.status(200).json({ 
                message: 'Users retrieved successfully from cache.', 
                users: JSON.parse(cachedUsers) 
            });
        }

        // Fetch from database if not in cache
        const users = await User.find({}, '-password');
        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        // Store in Redis cache with an expiration time (e.g., 1 hour)
        await redis.set('all_users', JSON.stringify(users), 'EX', 3600);

        console.log('Cache miss - users fetched from database and stored in Redis');
        return res.status(200).json({ 
            message: 'Users retrieved successfully.', 
            users 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

// forget password
const forgetPassword = async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

        // Save the token and expiration to the user model
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASSWORD 
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL,
            to: emailId,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Use the following token to reset your password: ${resetToken}\n\nThis token is valid for 1 hour.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset token sent to your email' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// reset password
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required' });
        }

        const user = await User.findOne({ resetToken });

        if (!user || user.resetTokenExpiration < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and reset token fields
        user.password = hashedPassword;
        user.resetToken = undefined; // Clear the reset token
        user.resetTokenExpiration = undefined; // Clear the reset token expiration
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const inviteUser = async (req, res) => {
    try {
        const { fullName, emailId, role } = req.body;

        if (!fullName || !emailId || !role) {
            return res.status(400).json({ message: 'Full Name, Email ID, and Role are required.' });
        }

        const userExist = await User.findOne({ emailId });

        if (userExist) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Create the invite email content
        const mailOptions = {
            from: process.env.EMAIL, 
            to: emailId,
            subject: 'You Are Invited to Work on Doctor CRM',
            text: `Hello ${fullName},\n\nYou are invited to work on the Doctor CRM system. Please follow the instructions to register and get started.\n\nBest Regards,\nThe Doctor CRM Team`
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASSWORD 
            }
        });

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: `An invitation has been sent to ${fullName} at ${emailId}.`
        });

    } catch (error) {
        console.error('Error inviting user:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const exportUsersToExcel = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); 

        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Define the headers for the worksheet
        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 20 },
            { header: 'Email ID', key: 'emailId', width: 30 },
            { header: 'Phone No', key: 'phoneNo', width: 15 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Photo', key: 'photo', width: 35 }  
        ];

        // Add user data to the worksheet
        users.forEach(user => {
            worksheet.addRow({
                fullName: user.fullName,
                emailId: user.emailId,
                phoneNo: user.phoneNo,
                address: user.address,
                role: user.role,
                photo: user.photo ? user.photo : 'No photo available' 
            });
        });

        // Set headers for the response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=users.xlsx'
        );

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error('Error exporting users to Excel:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    addUser,
    updateUser,
    deleteUser,
    getAllUsers,
    login,
    refreshAccessToken,
    logout,
    forgetPassword,
    resetPassword,
    inviteUser,
    exportUsersToExcel
};