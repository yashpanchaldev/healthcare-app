Auth APIs

Method	Endpoint	Description
POST	/signup	Signup for patient or doctor (with user_type)
POST	/login	Login and get JWT token
POST	/logout	Logout user
POST	/forgot-password	Request password reset
POST	/reset-password	Reset password using token

User APIs (Patient)

Method	Endpoint	Description
GET	/patients/profile	Get own profile
PUT	/patients/profile	Update profile
GET	/doctors	Browse/search doctors by specialty
GET	/doctors/:id	View doctor details
POST	/appointments	Book appointment
GET	/appointments	View own appointments
PUT	/appointments/:id	Update/cancel appointment
GET	/reports	View own health reports
GET	/pharmacy	Browse medicines
POST	/orders	Place medicine order
GET	/orders	View own orders

Doctor APIs

Method	Endpoint	Description
GET	/doctors/profile	Get own profile
PUT	/doctors/profile	Update profile
GET	/appointments	View appointments for doctor
PUT	/appointments/:id/status	Update appointment status (completed/canceled)
GET	/patients	View patients under doctor
GET	/reports/:patient_id	View patient reports
GET	/earnings	See consultation earnings

Admin APIs

Method	Endpoint	Description
POST	/admin/add-doctor	Add a new doctor
PUT	/admin/update-doctor/:id	Update doctor details
DELETE	/admin/delete-doctor/:id	Remove doctor
POST	/admin/add-patient	Add patient manually
PUT	/admin/update-patient/:id	Update patient details
DELETE	/admin/delete-patient/:id	Remove patient
GET	/admin/appointments	View all appointments
GET	/admin/orders	View all medicine orders
POST	/admin/add-pharmacy	Add new medicine/product
PUT	/admin/update-pharmacy/:id	Update medicine/product
DELETE	/admin/delete-pharmacy/:id	Remove medicine/product
GET	/admin/reports	View all reports
GET	/admin/users	View all users
Extra APIs

Search doctors by name/specialty: GET /doctors/search?query=cardiologist

Emergency services (ambulance): POST /emergency/request

Ratings & reviews: POST /doctors/:id/rate

✅ Summary Workflow:

Signup → User provides user_type (patient/doctor).
Admin adds doctor → Calls /admin/add-doctor → Inserts in Users + Doctors tables.
Patients book appointments, order medicines, view reports.
Doctors manage appointments, see patients, update earnings.
Admin manages everything.