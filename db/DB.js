const mongoose= require('mongoose');
require('dotenv').config();

const connectDB= ()=>{
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(()=>{
        console.log('Database is connected');   
    }).catch((err)=>{
        console.log('Database connection failed', err); 
    })
};

connectDB();

module.exports= connectDB;