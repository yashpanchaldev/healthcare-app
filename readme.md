HealthCare API Backend
🌟 Project Overview
This repository hosts the robust backend API for a comprehensive digital HealthCare platform. Built upon the powerful Node.js runtime and the minimalist Express.js framework, this application provides a centralized system for managing key healthcare operations, including secure user authentication, precise doctor appointment scheduling, complete medicine/pharmacy inventory management, dissemination of vital health article content, user cart functionality for prescriptions, and a robust reviews system. The architecture is designed to efficiently support both Patient (User) and Administrative roles.
The application adheres to a highly modular and clean architectural style, employing a robust MVC (Model-View-Controller) pattern augmented with dedicated Service and Repository layers (implied within the service/ directory). This separation ensures high maintainability, testability, and scalability for future feature development.
💡 Architectural Philosophy
Scalability and Performance
The choice of Node.js leverages its non-blocking, event-driven architecture, making the API highly efficient at handling numerous concurrent connections, which is critical for a high-traffic application like a healthcare platform. Express is used to provide the necessary routing and middleware structure without imposing unnecessary overhead.
Security and Reliability
Security is a primary concern. User authentication is managed using JSON Web Tokens (JWT), and sensitive data like passwords are never stored in plain text, utilizing industry-standard hashing algorithms. Furthermore, the authMiddleware ensures strict access control, verifying user identity and roles before granting access to protected resources (like /admin or /user routes).
✨ Key Features
User & Authentication
Secure Authentication: Implements standard user signup and login processes, complimented by seamless Google OAuth integration for quick access.
Password Management: Complete system for handling forgotten passwords, including token-based reset functionality delivered securely via email.
User Profiles: Dedicated endpoints to retrieve and update detailed patient profile information, ensuring data accuracy.
Authorization: Mandatory route protection using custom Express middleware to enforce role-based access for authenticated users and system administrators.
Doctor & Appointment Management
Doctor CRUD (Admin): Comprehensive administrative controls to add new doctors, manage their credentials and specializations, and soft-delete doctor profiles when necessary.
Doctor Scheduling (Admin): Tools for administrators or doctors themselves to define and manage doctor availability slots, optimizing patient flow and capacity.
Patient Actions: Patients can browse a complete list of available doctors, view detailed profiles (including reviews), and book, reschedule, or cancel appointments through dedicated transactional endpoints.
Review System: A dedicated module allows users to submit, edit, or delete reviews and ratings for doctors, providing valuable feedback and social proof.
Pharmacy & E-commerce
Medicine Category CRUD (Admin): Full administrative control over organizing medicines into categories (e.g., Pain Relief, Vitamins).
Medicine CRUD (Admin): Full lifecycle management for individual medicine products, including pricing, stock, description, and handling associated media (images, instructional videos) via specific media update/delete endpoints.
Cart Management (User): Enables patients to add prescribed or required medicines to a shopping cart, view the cart summary, adjust quantities, and remove items before checkout.
Health Content (Articles)
Article Management: Tools for content creators to draft, publish, update, and manage health articles.
Media Support: Robust handling for various media types (text, images, video) associated with each article, stored and managed externally via Cloudinary.
Content Organization: Dedicated CRUD operations for managing article categories (e.g., Nutrition, Mental Health).
User Engagement: Functionality for users to quickly save or unsave articles, with a dedicated route to retrieve a user's curated collection of saved content.
🛠️ Tech Stack & Rationale
|
| Component | Technology | Rationale |
| Runtime | Node.js | Non-blocking, high-performance execution for handling concurrent requests. |
| Framework | Express.js | Fast, unopinionated, minimal web framework for building RESTful APIs. |
| Database | MySQL / MariaDB | Relational database choice for structured medical records and transactional integrity. |
| Storage | Cloudinary | Cloud-based solution for scalable, reliable image and video asset management. |
| Email | SMTP | Standard protocol for reliable communication (password resets, welcome emails). |
| Middleware | JWT | Industry standard for secure, stateless user session management and authentication. |
🚀 Getting Started
Prerequisites
To run this project locally, ensure you have the following software installed:
Node.js (Version 18 or later is recommended).
npm or yarn (for dependency management).
A running MySQL or MariaDB instance, which will host the application data.
Installation
Clone the repository:
git clone <repository_url>
cd healthcare-api-backend



Install dependencies:
npm install
# or
yarn install



Database Setup: Before running the server, ensure your database schema exists and the connection parameters are correctly configured in the .env file. You may need to run initial migration scripts (if available) to set up the necessary tables (e.g., users, doctors, appointments, medicines).
Environment Configuration
The application uses dynamic configuration based on the NODE_ENV. You must set this variable and fill in the corresponding variables (LOCAL_, DEV_, PROD_).
| Variable | Scope | Description | Example Value |
| NODE_ENV | All | Application environment (switches configuration sets). | LOCAL |
| APP_SECRET | All | CRITICAL: Secret key for signing JWTs. | your_long_secure_jwt_secret |
| LOCAL_PORT | Local | Port for the local server to listen on. | 8080 |
| LOCAL_DB_HOST | Local | Database host address. | localhost |
| LOCAL_DB_USER | Local | Database username. | root |
| LOCAL_DB_PASS | Local | Database password. | your_db_password |
| LOCAL_DB_NAME | Local | Name of the database schema (healthCare-app). | healthCare-app |
| LOCAL_SMTP_HOST | Local | SMTP server host (e.g., smtp.gmail.com). | smtp.gmail.com |
| LOCAL_SMTP_PASS | Local | Email account App Password for sending emails. | csjprhcbtwijnull |
| LOCAL_CLOUDINARY_CLOUD_NAME | Local | Cloudinary Cloud Name for media storage. | dtebpfbms |
| DEV_PORT | Dev | Port for the development server. | 3000 |
| PROD_DB_HOST | Prod | Database host address for production. | prod-db-instance.com |
| PROD_SMTP_USER | Prod | Production email address for notifications. | noreply@prod-app.com |
| PROD_CLOUDINARY_API_SECRET | Prod | Production Cloudinary API Secret. | your_api_secret |
| LOCAL_MANGOPAY_* | Local | Mangopay payment gateway credentials. | dummy |
Run the application:
npm start
# or
npm run dev  // Use a development script for nodemon/hot-reloading


The API server will be available at the address configured in your .env file, typically http://localhost:8080.
🗺️ API Endpoints
All authenticated routes require a valid JSON Web Token (JWT), which must be included in the request headers as an Authorization bearer token: Authorization: Bearer <token>.
General API Standards
API Root: All primary routes are prefixed with /api/.
Response Format: All successful responses return a JSON object containing a status (success/error), message, and a data object/array.
Error Handling: Standardized HTTP status codes are used for error reporting (e.g., 400 for Bad Request, 401 for Unauthorized, 404 for Not Found, 500 for Server Error).
1. Authentication (Public) - /api/auth
| Method | Endpoint | Description |
| POST | /signup | Register a new patient account. |
| POST | /login | Authenticate and retrieve JWT for an existing user. |
| POST | /google | Handle sign-in/sign-up flow via Google credentials. |
| POST | /forgot_password | Request a password reset email. Requires email in the body. |
| POST | /reset_password | Finalize password reset using the token provided via email. |
2. User/Patient Routes (Protected) - /api/user
| Method | Endpoint | Description |
| GET | /patients/profile | Retrieve the detailed profile of the authenticated user. |
| PUT | /patients/profile | Update user profile fields (e.g., name, contact info). |
| POST | /change_pass | Securely change the user's current password. |
| GET | /doctors | Fetch a paginated list of all available doctors (filterable/searchable). |
| GET | /doctors/:id | Retrieve the complete profile, services, and schedule for a specific doctor. |
| POST | /appointment/book | Create a new appointment booking for a doctor slot. |
| GET | /appointment | List all upcoming and past appointments belonging to the user. |
| PUT | /appointments/:id | Modify booking details (e.g., time, service) of an existing appointment. |
| PUT | /appointments/cancel/:id | Mark a scheduled appointment as cancelled. |
3. Administration Routes (Protected, Requires Admin Role) - /api/admin
| Method | Endpoint | Description |
| POST | /add-doctor | Create a new doctor record and associated user account. |
| PUT | /update-doctor/:doctor_id | Update all non-sensitive details of a doctor profile. |
| DELETE | /delete-doctor/:doctor_id | Soft-delete a doctor record from the system. |
| GET | /allAppointments | Retrieve a filtered list of all appointments system-wide. |
| POST | /doctor/slot/:id | Define new available time slots for a specific doctor ID. |
Medicine Management (Admin)
| Method | Endpoint | Description |
| POST | /medicine/category | Create a new parent category for medicines. |
| GET | /medicine/category | Retrieve all medicine categories. |
| GET | /medicine/category/:id | Get details of a single medicine category. |
| PUT | /medicine/category/:id | Update an existing medicine category. |
| DELETE | /medicine/category/:id | Delete a medicine category. |
| POST | /medicine | Create a new medicine product entry. |
| GET | /medicine | Get all available medicine products (catalog view). |
| PUT | /medicine/:id | Update product details for a specific medicine. |
| DELETE | /medicine/:id | Delete a medicine product. |
| PUT | /medicine/media/:id | Update media associated with a medicine (e.g., new image). |
| DELETE | /medicine/media/:id | Remove a piece of media from a medicine product. |
4. Article & Content Routes (Protected) - /api/article
| Method | Endpoint | Description |
| POST | /category/create | Create a new category for articles (e.g., "Vaccines"). |
| POST | /master/create | Create the main article entry (title, author, category). |
| POST | /media | Add an image, video, or rich text block to an article. |
| POST | /master/save | Used by users to add or remove an article from their "Saved" list. |
| GET | /master/saved/:user_id | Retrieve all articles marked as saved by the specified user. |
| GET | /media/:article_id | Retrieve all media parts composing the full content of an article. |
| PUT | /media/:id | Update specific content media (text, image, video). |
| DELETE | /media/:id | Remove a media part from an article. |
5. Cart & Review Routes (Protected)
| Route | Method | Endpoint | Description |
| Cart | POST | /api/cart/add-cart | Add a new medicine item to the user's active cart. |
| Cart | GET | /api/cart/ | Retrieve all items currently in the authenticated user's cart. |
| Cart | PUT | /api/cart/:id | Update the quantity of a specific cart item ID. |
| Cart | DELETE | /api/cart/:id | Remove a single item from the cart. |
| Review | POST | /api/review | Submit a new review/rating for a doctor or service. |
| Review | PUT | /api/review/:id | Update an existing review by its ID. |
| Review | DELETE | /api/review/:id | Delete a submitted review. |
| Review | GET | /api/review/doctor/:id | Get all reviews and average ratings for a given doctor. |
📁 File Structure Deep Dive
The architecture emphasizes separation of concerns across multiple layers:
healthcare-api-backend/
├── controller/         # The request handlers
│   # ...
├── middleware/         # Custom logic executed between request and controller
│   ├── auth.js         # JWT verification, role checking, and user context attachment
│   # ...
├── routes/             # API route definitions and request delegation
│   # ...
├── service/            # Core business logic layer
│   ├── base.js         # Utility functions or common database interactions
│   ├── mail.js         # Abstraction for sending emails (SMTP configuration)
│   ├── notify.js       # Logic for various application notifications
│   # ...
├── views/              # Templates for emails (EJS format)
│   ├── emails/
│   │   ├── forgotPass.ejs   # Template for password reset emails
│   │   └── welcome-mail.ejs # Template for new user welcome emails
├── .env                # Environment variables file
└── app.js              # Application bootstrapping (Express configuration, middleware setup, and router loading)



Role of Key Directories
controller/: These files handle incoming requests from the routes. Their main job is to validate input, delegate tasks to the service layer, and format the final HTTP response (including handling status codes and sending JSON data). They act as the public interface to the application logic.
service/: This is the heart of the business logic. Service files encapsulate complex operations like database transactions, external API calls (Cloudinary, Mangopay), and complex data manipulations. By abstracting this logic, controllers remain lean, and the application becomes easier to test and maintain.
middleware/: Contains functions that process incoming requests before they hit the controller. The most important here is authMiddleware, which ensures that only users with a valid token and the correct permissions can access protected endpoints.
