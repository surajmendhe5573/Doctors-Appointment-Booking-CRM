const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Doctor', 'Manager', 'CA', 'Admin', 'Secondary Admin'],
    },
    photo: {  
        type: String,  // This can store the file path or URL to the photo
        default: null
    },
    refreshToken: { 
        type: String,
        default: null
    },
    resetToken: { 
        type: String,
        default: null
    },
    resetTokenExpiration: { 
        type: Date,
        default: null
    }
});


module.exports = new mongoose.model('User', userSchema);
