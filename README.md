# Doctors Appointment Booking CRM

## Project Overview  
The Doctors Appointment Booking CRM is a comprehensive system designed to manage healthcare operations efficiently. It streamlines user management, hospital details, patient reports, and appointment schedules, ensuring a seamless experience for patients, doctors, and administrators.

## Features  

### Users API  
- Add User: Register a new user.  
- Login: Authenticate and log in users securely.  
- Edit User Details: Update user profile information.  
- Delete User: Remove users from the system.  
- Retrieve All Users: Fetch a list of all registered users.  
- Refresh Token: Renew authentication tokens.  
- Logout: End user sessions securely.  
- Forget Password: Send email for password recovery.  
- Reset Password: Reset the password using a secure link.  
- Invite User: Invite new users to join via email.  

### Hospital API  
- Add Hospital: Add new hospital records.  
- Update Hospital Details: Modify existing hospital information.  
- Delete Hospital: Remove hospitals no longer required.  
- Retrieve Hospitals: Fetch a list of all hospitals.  

### Report API  
- Add Report: Create and store new patient reports.  
- Update Report Details: Modify existing report data.  
- Delete Reports: Remove outdated or unnecessary reports.  
- Retrieve Report Details: Fetch specific patient reports.  
- Fetch Reports Date-Wise: Retrieve reports within a date range.  

### Appointment Schedule API  
- Create Schedule: Set up doctor schedules for appointments.  
- Update Schedule: Modify schedules for availability or changes.  
- Delete Schedule: Remove obsolete schedules.  
- Retrieve All Schedules: Fetch all schedules for doctors.  
- Update Status: Change appointment status (e.g., Upcoming, Done, Not Available).  
- Transfer Appointment: Reassign appointments to another doctor.  
- Retrieve Upcoming Schedules: Fetch upcoming appointments.  
- Retrieve Done Schedules: Fetch completed appointments.  
- Get Transferred Appointments: Track rescheduled or transferred appointments.  
- Retake Transferred Appointment: Reclaim appointments if needed.  
- Fetch Schedule Date-Wise: Retrieve schedules for specific dates.  
- Payment Update: Manage and update payment statuses for appoint

## Tech Stack

- **Backend:** Node.js, Express.js
- **Databases:** MongoDB, Redis (for caching)
- **Authentication:** JSON Web Tokens (JWT)
- **API Gateway:** Routing and securing microservices

---


## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB and Redis instances running


## Installation and Setup
- Clone the repository
```
git clone git clone https://github.com/surajmendhe5573/BookMyStay.git

```
- Install dependencies
```
cd <bookmystay>
npm install
```
- Build and run the project
```
npm start
```

## Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```
# Base URLs for Microservices 
USER_SERVICE_BASE_URL=http://localhost:5000/api/users
HOTEL_SERVICE_BASE_URL=http://localhost:5001/api/hotels
BOOKING_SERVICE_BASE_URL=http://localhost:5002/api/bookings
PAYMENT_SERVICE_BASE_URL=http://localhost:5003/api/payments
NOTIFICATION_SERVICE_BASE_URL=http://localhost:5004/api/notifications
REVIEW_SERVICE_BASE_URL=http://localhost:5005/api/reviews

# Application Port
PORT=3000

# JWT Secret Key
JWT_SECRET=<your-jwt-secret>

# PayPal Configuration
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
PAYPAL_MODE=sandbox

# SMTP Configuration
SMTP_EMAIL=<your-email>
SMTP_PASSWORD=<your-email-password>


```

## 🚀 About Me
I'm a Backend developer...


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://github.com/surajmendhe5573)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/suraj-mendhe-569879233/?original_referer=https%3A%2F%2Fsearch%2Eyahoo%2Ecom%2F&originalSubdomain=in)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/)
