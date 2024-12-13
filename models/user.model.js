const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobileNo: {
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
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Doctor', 'Manager', 'CA', 'Admin', 'Secondary Admin'],
    }
});


module.exports = new mongoose.model('User', userSchema);
