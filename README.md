# 🦷 Dental Clinic Management System - Backend

A scalable and secure RESTful API for managing a dental clinic, built with **Node.js**, **Express.js**, and **MongoDB**.

The backend provides authentication, patient management, appointments, financial tracking, image uploads, reviews, and role-based access control.

---

# 🚀 Features

- 🔐 JWT Authentication
- 👨‍⚕️ Multi User Roles
  - Admin
  - Doctor
  - Receptionist
- 👥 Patient Management
- 📅 Appointment Scheduling
- 🦷 Follow-up Visits
- 💰 Payments Management
- 📊 Debt Tracking
- 📈 Dashboard Statistics
- ⭐ Reviews Management
- 🖼 Patient Image Upload (Cloudinary)
- 🛡 Role-Based Authorization
- ⚡ Rate Limiting
- 🔒 Password Hashing
- 📝 Request Validation
- 🌐 REST API
- ☁ Cloudinary Integration

---

# 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- Multer
- Cloudinary
- Redis
- Helmet
- CORS

---

# 📂 Project Structure

```text
src/
│
├── DB/
│   ├── model/
│   └── connection/
│
├── modules/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│   ├── appointment/
│   ├── review/
│   └── expense/
│
├── middleware/
│
├── utils/
│
├── common/
│
├── services/
│
└── app.js
```

---

# 🔑 Authentication

Authentication is based on **JSON Web Tokens (JWT)**.

Include the access token in every protected request.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

# 👤 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access |
| Doctor | Manage patients, appointments and treatments |
| Receptionist | Register patients, appointments and payments |

---

# 📦 Main Modules

## Authentication

- Login
- Logout
- Change Password
- Forgot Password
- Reset Password
- Refresh Token

---

## Patients

- Create Patient
- Edit Patient
- Delete Patient
- Patient Details
- Upload Images
- Payment History
- Follow-up Visits

---

## Appointments

- Book Appointment
- Reschedule
- Cancel
- Today's Appointments
- Doctor Schedule
- Available Time Slots

---

## Finance

- Payments
- Remaining Balance
- Debt Alerts
- Expenses
- Revenue Reports

---

## Reviews

- Add Review
- Approve Review
- Delete Review

---

# 🌐 Environment Variables

Create a `.env` file.

```env
PORT=3000

DB_URL=

ACCESS_SECRET=

REFRESH_SECRET=

ACCESS_EXPIRES_IN=

REFRESH_EXPIRES_IN=

CLOUD_NAME=

API_KEY=

API_SECRET=

REDIS_URL=

ORIGIN=
```

---

# 📥 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/dental-clinic-backend.git
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 📡 API Overview

## Authentication

```
POST /auth/login
POST /auth/logout
PATCH /auth/update-password
```

## Patients

```
GET    /patient
POST   /patient
GET    /patient/:id
PATCH  /patient/:id
DELETE /patient/:id
```

## Appointments

```
GET  /appointment
POST /appointment
PATCH /appointment/status/:id
PATCH /appointment/reschedule/:id
```

## Reviews

```
GET /review
POST /review
PATCH /review/:id/approve
DELETE /review/:id
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Rate Limiting
- Helmet
- CORS
- Request Validation
- Protected Routes

---

# 📈 Future Improvements

- Email Notifications
- SMS Reminders
- Online Booking
- Reports Export (PDF / Excel)
- Multi Clinic Support
- Audit Logs

---

# 👨‍💻 Author

**Sayed Mansour**

---

# 📄 License

This project is licensed for educational and portfolio purposes.