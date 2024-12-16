const express= require('express');
const app= express();
const cors= require('cors');
require('dotenv').config();

// middleware
app.use(express.json());
app.use(cors());

const port= process.env.PORT || 6000

app.get('/', (req, res)=>{
    res.send('Doctors-Appointment-Booking-CRM');
});

require('./db/DB');

// routes
app.use('/api/users', require('./routes/user'));
app.use('/api/hospitals', require('./routes/hospital.route'));
app.use('/api/reports', require('./routes/report'));

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})