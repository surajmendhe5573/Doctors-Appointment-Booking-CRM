const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Hospital model
        ref: 'Hospital',
        required: true,
    },
    surgeryType: {
        type: String,
        required: true,
    },

    patientName: {
        type: String,
        required: true,
    },
  
    startTime: { type: Date, required: true }, // Start time
    endTime: { type: Date, required: true },
    payment: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Done', 'Pending'], 
        default: 'Done'
    }
});

module.exports = mongoose.model('Report', reportSchema);