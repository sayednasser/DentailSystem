# 🦷 Dental Clinic Management System - Backend

A scalable and secure RESTful API for managing a dental clinic, built with **Node.js**, **Express.js**, and **MongoDB**.

The backend provides authentication, patient management, appointment scheduling, financial tracking, image uploads, reviews, dashboard analytics, and role-based access control.

---

## 🚀 Features

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
- 📈 Dashboard Analytics
- 💵 Expenses Management
- ⭐ Reviews Management
- 🖼 Patient Image Upload (Cloudinary)
- 👤 User Profile Management
- 🛡 Role-Based Authorization
- ⚡ Rate Limiting
- 🔒 Password Hashing
- 📝 Request Validation
- ☁ Cloudinary Integration
- 🌐 RESTful API

---

# 📚 Table of Contents

- Features
- Tech Stack
- Project Structure
- Authentication
- User Roles
- API Response
- Installation
- Environment Variables
- API Reference
- Security
- Future Improvements
- Author

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Joi | Validation |
| Multer | File Upload |
| Cloudinary | Image Storage |
| Redis | Caching |
| Helmet | Security Headers |
| CORS | Cross-Origin Requests |

---

# 📂 Project Structure

```text
src/
│
├── DB/
│   ├── connection/
│   └── model/
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│   ├── appointment/
│   └── review/
│
├── middleware/
│
├── common/
│
├── services/
│
├── utils/
│
└── app.js
```

---

# 🔐 Authentication

Authentication uses **JWT Access Token**.

Include the token in every protected request.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

# 🔄 Authentication Flow

```text
Login
   │
   ▼
Receive Access Token
   │
   ▼
Authorization: Bearer TOKEN
   │
   ▼
Access Protected Routes
   │
   ▼
Refresh Token
```

---

# 👤 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full System Access |
| Doctor | Patients, Treatments, Appointments |
| Receptionist | Registration, Payments, Appointments |

---

# 📦 API Response Format

### Success

```json
{
  "message": "Success",
  "data": {},
  "status": 200
}
```

### Error

```json
{
  "message": "Unauthorized",
  "status": 401
}
```

---

# 📥 Installation

Clone the repository

```bash
git clone https://github.com/sayednasser/DentailSystem.git
```

Install dependencies

```bash
npm install
```

Development

```bash
npm run start:dev
```

Production

```bash
npm run start:prod
```

---

# 🌐 Environment Variables

Create a `.env` file.

```env
PORT=

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

# 📡 API Reference

---

# 🔐 Authentication

| Method | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login |
| PATCH | `/auth/forgot-password` | ❌ | Request password reset |
| PATCH | `/auth/verify-forgot-password` | ❌ | Verify reset code |
| PATCH | `/auth/reset-forgot-password` | ❌ | Reset password |

---

# 👤 User

| Method | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/user` | ✅ | Current profile |
| POST | `/user/update-profile` | ✅ | Update profile |
| PATCH | `/user/update-password` | ✅ | Change password |
| PATCH | `/user/profile-picture` | ✅ | Upload profile image |
| PATCH | `/user/profile-cover-picture` | ✅ | Upload cover image |
| POST | `/user/logout` | ✅ | Logout |
| GET | `/user/rotate-token` | 🔄 | Refresh access token |
| GET | `/user/:userId/share` | ❌ | Public profile |

---

# 👨‍💼 Admin

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/admin/doctors` | Create doctor |
| POST | `/admin/receptions` | Create receptionist |
| GET | `/admin/users` | Get all users |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/dashboard` | Dashboard |
| GET | `/admin/stats` | Statistics |
| GET | `/admin/patients` | All patients |
| GET | `/admin/income` | Daily income |
| GET | `/admin/doctors/performance` | Doctor performance |
| GET | `/admin/analytics/revenue` | Revenue analytics |
| GET | `/admin/alerts/debt` | Debt alerts |
| GET | `/admin/payments/recent` | Recent payments |

### Expenses

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/expenses` | Get expenses |
| POST | `/admin/expenses` | Create expense |
| DELETE | `/admin/expenses/:id` | Delete expense |

---

# 👨‍⚕️ Doctor

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/doctor/dashboard` | Dashboard |
| GET | `/doctor/patients` | My patients |
| GET | `/doctor/stats` | Statistics |
| GET | `/doctor/profile` | Profile |
| PATCH | `/doctor/profile` | Update profile |
| PUT | `/doctor/working-hours/:doctorId` | Working hours |
| GET | `/doctor/all` | All doctors |
| PATCH | `/doctor/patients/:patientId/complete` | Complete treatment |

---

# 🦷 Patients

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/patient` | Create patient |
| GET | `/patient` | Get patients |
| GET | `/patient/:patientId` | Patient details |
| PATCH | `/patient/:patientId` | Update patient |
| DELETE | `/patient/:patientId` | Delete patient |
| PATCH | `/patient/:patientId/status` | Update status |
| PATCH | `/patient/:patientId/payment` | Add payment |
| PATCH | `/patient/:id/increase-total` | Increase treatment cost |
| PATCH | `/patient/:patientId/diagnosis` | Update diagnosis |
| PATCH | `/patient/:patientId/treatment` | Update treatment |
| PATCH | `/patient/:patientId/check-in` | Check-in patient |
| PATCH | `/patient/:patientId/followup` | Register follow-up visit |

### Patient Images

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/patient/:id/images` | Upload images |
| GET | `/patient/:id/images` | Get images |

---

# 📅 Appointments

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/appointment/available-slots` | Available slots |
| POST | `/appointment` | Create appointment |
| GET | `/appointment/doctor` | Doctor appointments |
| GET | `/appointment/my` | Logged doctor appointments |
| PATCH | `/appointment/status/:appointmentId` | Update status |
| PATCH | `/appointment/reschedule/:appointmentId` | Reschedule |
| GET | `/appointment/today` | Today's appointments |
| GET | `/appointment/patient/:patientId` | Patient history |

---

# ⭐ Reviews

| Method | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/review` | ❌ | Create review |
| GET | `/review` | ❌ | Approved reviews |
| GET | `/review/admin` | ✅ | All reviews |
| PATCH | `/review/:reviewId/approve` | ✅ | Approve review |
| DELETE | `/review/:reviewId` | ✅ | Delete review |

---

# 📊 API Statistics

| Module | Endpoints |
|---------|-----------|
| Authentication | 4 |
| User | 8 |
| Admin | 15 |
| Doctor | 8 |
| Patient | 14 |
| Appointment | 8 |
| Review | 5 |

### Total REST Endpoints

**62+ Endpoints**

---

# 🗄 Database Collections

- Users
- Doctors
- Patients
- Appointments
- Reviews
- Expenses

---

# 🔒 Security

- JWT Authentication
- Refresh Token Rotation
- Role-Based Authorization
- Password Hashing (bcrypt)
- Request Validation (Joi)
- Rate Limiting
- Helmet
- CORS Protection
- Cloudinary Secure Uploads

---

# 🚀 Future Improvements

- Email Notifications
- SMS Reminders
- Online Booking
- PDF Reports
- Excel Export
- Audit Logs
- Multi Clinic Support
- Multi Language Support

---

# 👨‍💻 Author

**Sayed Mansour**

Backend Developer

---

# 📄 License

This project is licensed under the **MIT License**.