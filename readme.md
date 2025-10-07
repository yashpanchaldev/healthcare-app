# HealthCare API Backend

## 🌟 Project Overview
This repository hosts the robust backend API for a comprehensive digital HealthCare platform. Built on **Node.js** with the **Express.js** framework, this API provides a centralized system for managing key healthcare operations including:

- Secure user authentication
- Doctor appointment scheduling
- Medicine and pharmacy inventory management
- Health article content management
- User cart functionality for prescriptions
- Doctor and service reviews system

The application supports both **Patient (User)** and **Administrative** roles, following a modular architecture with a **MVC pattern**, along with dedicated Service and Repository layers for maintainability and scalability.

---

## 💡 Architectural Philosophy

### Scalability & Performance
- Node.js provides a non-blocking, event-driven architecture suitable for high concurrency.
- Express.js handles routing and middleware efficiently without unnecessary overhead.

### Security & Reliability
- **Authentication**: Managed via JSON Web Tokens (JWT).
- **Data Security**: Passwords are securely hashed; authMiddleware enforces role-based access.
- **Access Control**: Protected routes ensure only authorized users can access sensitive operations.

---

## ✨ Key Features

### User & Authentication
- **Secure Sign-Up/Login** with JWT.
- **Google OAuth** integration.
- **Password Management** with token-based reset emails.
- **User Profiles**: Retrieve and update patient info.
- **Authorization**: Role-based access enforced via middleware.

### Doctor & Appointment Management
- **Doctor CRUD** (Admin only).
- **Doctor Scheduling** and slot management.
- **Patient Actions**: View doctors, book/reschedule/cancel appointments.
- **Review System**: Users can submit, update, or delete reviews.

### Pharmacy & E-Commerce
- **Medicine Category CRUD** (Admin).
- **Medicine CRUD** with media management (images/videos).
- **Cart Management** for users to manage prescriptions.

### Health Content (Articles)
- **Article CRUD**: Create, update, manage health articles.
- **Media Support**: Text, images, and videos stored in Cloudinary.
- **Article Categories** for organized content.
- **Saved Articles**: Users can save or unsave articles for quick access.

---

## 🛠️ Tech Stack & Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime   | Node.js   | Non-blocking, high-performance execution for concurrent requests. |
| Framework | Express.js | Fast, minimal framework for RESTful APIs. |
| Database  | MySQL / MariaDB | Relational DB for structured medical records and transactions. |
| Storage   | Cloudinary | Scalable cloud-based media storage. |
| Email     | SMTP | Reliable communication for password resets & notifications. |
| Middleware| JWT | Secure stateless session management and authentication. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **npm** or **yarn**
- **MySQL / MariaDB** instance running locally or remotely

### Installation

# Clone the repo
git clone <repository_url>
cd healthcare-api-backend

# Install dependencies
npm install
# or
yarn install
Database Setup

Configure database connection in .env.

Run initial migration scripts if available.

Ensure necessary tables exist (users, doctors, appointments, medicines, etc.).

Environment Configuration

Set environment variables in .env:

Variable	Scope	Description	Example
NODE_ENV	All	Application environment	LOCAL
APP_SECRET	All	JWT signing secret	your_long_secure_jwt_secret
LOCAL_PORT	Local	Local server port	8080
LOCAL_DB_HOST	Local	Database host	localhost
LOCAL_DB_USER	Local	Database user	root
LOCAL_DB_PASS	Local	DB password	your_db_password
LOCAL_DB_NAME	Local	DB schema name	healthCare-app
LOCAL_SMTP_HOST	Local	SMTP host	smtp.gmail.com
LOCAL_SMTP_PASS	Local	SMTP app password	your_app_password
LOCAL_CLOUDINARY_CLOUD_NAME	Local	Cloudinary cloud name	your_cloud_name
DEV_PORT	Dev	Development port	3000
PROD_DB_HOST	Prod	Production DB host	prod-db-instance.com
PROD_SMTP_USER	Prod	Production email	noreply@prod-app.com

PROD_CLOUDINARY_API_SECRET	Prod	Production Cloudinary API Secret	your_api_secret
Run the application
npm start
# or for development with hot reload
npm run dev


The server runs at http://localhost:<LOCAL_PORT>.

🗺️ API Endpoints

All protected routes require a valid JWT Bearer token in the headers.

1. Authentication (Public) - /api/auth
Method	Endpoint	Description
POST	/signup	Register new user
POST	/login	Login and get JWT
POST	/google	Google OAuth login/signup
POST	/forgot_password	Request password reset
POST	/reset_password	Reset password with token
2. User/Patient Routes (Protected) - /api/user
Method	Endpoint	Description
GET	/patients/profile	Get authenticated user profile
PUT	/patients/profile	Update user profile
POST	/change_pass	Change user password
GET	/doctors	List all doctors
GET	/doctors/:id	Get doctor details
POST	/appointment/book	Book appointment
GET	/appointment	List user appointments
PUT	/appointments/:id	Update appointment
PUT	/appointments/cancel/:id	Cancel appointment
3. Administration Routes (Protected, Admin) - /api/admin
Method	Endpoint	Description
POST	/add-doctor	Add new doctor
PUT	/update-doctor/:doctor_id	Update doctor
DELETE	/delete-doctor/:doctor_id	Soft-delete doctor
GET	/allAppointments	List all appointments
POST	/doctor/slot/:id	Add doctor slots
4. Medicine Management (Admin)
Method	Endpoint	Description
POST	/medicine/category	Add medicine category
GET	/medicine/category	Get all categories
GET	/medicine/category/:id	Get category details
PUT	/medicine/category/:id	Update category
DELETE	/medicine/category/:id	Delete category
POST	/medicine	Add medicine product
GET	/medicine	Get all medicines
PUT	/medicine/:id	Update medicine
DELETE	/medicine/:id	Delete medicine
PUT	/medicine/media/:id	Update medicine media
DELETE	/medicine/media/:id	Delete medicine media
5. Article & Content Routes (Protected) - /api/article
Method	Endpoint	Description
POST	/category/create	Create article category
POST	/master/create	Create main article
POST	/media	Add article media
POST	/master/save	Save/unsave article
GET	/master/saved/:user_id	Get saved articles
GET	/media/:article_id	Get article media
PUT	/media/:id	Update media
DELETE	/media/:id	Delete media
6. Cart & Review Routes (Protected)
Route	Method	Endpoint	Description
Cart	POST	/api/cart/add-cart	Add item to cart
Cart	GET	/api/cart	Get cart items
Cart	PUT	/api/cart/:id	Update quantity
Cart	DELETE	/api/cart/:id	Remove item
Review	POST	/api/review	Submit review
Review	PUT	/api/review/:id	Update review
Review	DELETE	/api/review/:id	Delete review
Review	GET	/api/review/doctor/:id	Get doctor reviews
📁 File Structure
healthcare-api-backend/
├── controller/       # Request handlers
├── middleware/       # Auth, validation, other middleware
├── routes/           # API route definitions
├── service/          # Business logic, DB interactions, external APIs
├── views/            # Email templates (EJS)
├── .env              # Environment variables
└── app.js            # App bootstrapping


Key Directories

controller/: Validates input, delegates to service layer, formats responses.

service/: Handles DB operations, complex logic, and external integrations.

middleware/: Pre-processes requests; authMiddleware handles JWT validation and role access.

✅ Contributing

Fork the repository.

Create a feature branch: git checkout -b feature/your-feature

Commit changes: git commit -m "Add your feature"

Push branch: git push origin feature/your-feature

Open a pull request.
