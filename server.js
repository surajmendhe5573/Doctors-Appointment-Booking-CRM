const express= require('express');
const app= express();
require('dotenv').config();

// middleware
app.use(express.json());

const port= process.env.PORT || 6000

app.get('/', (req, res)=>{
    res.send('Doctors-Appointment-Booking-CRM');
});

require('./db/DB');

// routes
app.use('/api/users', require('./routes/user'));

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})