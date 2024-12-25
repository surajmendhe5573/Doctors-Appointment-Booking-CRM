const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    hospitalName: {
        type: String,
        required: true
    },
    hospitalEmailId: {
        type: String,
        required: true,
        unique: true
    },
    hospitalPhoneNo: {
        type: String,
        required: true
    },
    adminFullName: {
        type: String,
        required: true
    },
    adminPhoneNo: {
        type: String,
        required: true
    },
    totalSchedulePayment: {
        type: Number,
        default: 0, // Default value is 0
    },
}, { timestamps: true }); 

module.exports = mongoose.model('Hospital', hospitalSchema);
