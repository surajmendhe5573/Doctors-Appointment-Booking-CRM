# Doctors Appointment Booking CRM

## Project Overview  
The Doctors Appointment Booking CRM is a comprehensive system designed to manage healthcare operations efficiently. It streamlines user management, hospital details, patient reports, and appointment schedules, ensuring a seamless experience for patients, doctors, and administrators.

## Features

### 1. Users API
- **Add User**: Register a new user.
- **Login**: Authenticate and log in users securely.
- **Edit User Details**: Update user profile information.
- **Delete User**: Remove users from the system.
- **Retrieve All Users**: Fetch a list of all registered users.
- **Refresh Token**: Renew authentication tokens.
- **Logout**: End user sessions securely.
- **Forget Password**: Send email for password recovery.
- **Reset Password**: Reset the password using a secure link.
- **Invite User**: Invite new users to join via email.

### 2. Hospital API
- **Add Hospital**: Add new hospital records.
- **Update Hospital Details**: Modify existing hospital information.
- **Delete Hospital**: Remove hospitals no longer required.
- **Retrieve Hospitals**: Fetch a list of all hospitals.

### 3. Report API
- **Add Report**: Create and store new patient reports.
- **Update Report Details**: Modify existing report data.
- **Delete Reports**: Remove outdated or unnecessary reports.
- **Retrieve Report Details**: Fetch specific patient reports.
- **Fetch Reports Date-Wise**: Retrieve reports within a date range.

### 4. Appointment Schedule API
- **Create Schedule**: Set up doctor schedules for appointments.
- **Update Schedule**: Modify schedules for availability or changes.
- **Delete Schedule**: Remove obsolete schedules.
- **Retrieve All Schedules**: Fetch all schedules for doctors.
- **Update Status**: Change appointment status (e.g., Upcoming, Done, Not Available).
- **Transfer Appointment**: Reassign appointments to another doctor.
- **Retrieve Upcoming Schedules**: Fetch upcoming appointments.
- **Retrieve Done Schedules**: Fetch completed appointments.
- **Get Transferred Appointments**: Track rescheduled or transferred appointments.
- **Retake Transferred Appointment**: Reclaim appointments if needed.
- **Fetch Schedule Date-Wise**: Retrieve schedules for specific dates.
- **Payment Update**: Manage and update payment statuses for appointments.

## Benefits
- Streamlined healthcare operations.
- Enhanced user experience for patients, doctors, and administrators.
- Efficient management of appointments, reports, and hospitals.
- Secure and scalable platform.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Databases:** MongoDB, Redis (for caching)
- **Authentication:** JSON Web Tokens (JWT)
- **Email Services**: Nodemailer 

---


## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB and Redis instances running


## Installation and Setup
- Clone the repository
```
git clone git clone https://github.com/surajmendhe5573/Doctors-Appointment-Booking-CRM.git

```
- Install dependencies
```
cd <Doctor Appointment Booking CRM>
npm install
```
- Build and run the project
```
npm start
```

## Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```
# Port
PORT=5000

# Database Connection
MONGODB_URI=mongodb://localhost:27017/defaultdb


# JWT Secrets
JWT_SECRET=your_jwt_auth_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Email credentials
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_password


```

## 🚀 About Me
I'm a Backend developer...


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://github.com/surajmendhe5573)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/suraj-mendhe-569879233/?original_referer=https%3A%2F%2Fsearch%2Eyahoo%2Ecom%2F&originalSubdomain=in)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/)
