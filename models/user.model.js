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
    refreshToken: { 
        type: String,
        default: null
    }
});

// Hash the password before saving the user
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         const bcrypt = require('bcrypt');
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// });

module.exports = new mongoose.model('User', userSchema);
