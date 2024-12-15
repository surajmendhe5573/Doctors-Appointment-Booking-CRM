const mongoose= require('mongoose');

const hospitalSchema= new mongoose.Schema({
    hospitalName: {
        type: String,
        required: true
    },
    adminPerson: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    surgeriesDone: {
        type: Number,
        require: true
    },
    totalPayment: {
        type: String,
        required: true
    }, 
    paymentStatus: {    
        type: String,   // 'done' or 'due'
        required: true
    }
})

module.exports= new mongoose.model('Hospital', hospitalSchema);