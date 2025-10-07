import axios from "axios";
import "../../routes/auth.js";
import { Base } from "../../service/base.js";
import { CONFIG } from "../../config/flavour.js";

export default class userController extends Base {
  constructor() {
    super();
  }
  async getProfile(req, res, next) {
        try {
            const patientId = req._id; // from JWT

            // Fetch patient profile
            const patient = await this.selectOne(
                `SELECT id, name, email, phone_number, age, gender, address, profile_photo 
                 FROM users WHERE id = ?`,
                [patientId]
            );

            if (!patient) {
                this.s = 0;
                this.m = "Patient not found";
                return this.send_res(res); }
            this.s = 1;
            this.m = "Profile fetched successfully";
            this.r = patient;
            return this.send_res(res);

        } catch (error) {
            this.s = 0;
            this.err = error.message;
            return this.send_res(res);
        }
    }
async updateProfile(req, res, next) {
  try {
    const patientId = req._id;
    const { name, phone_number, age, gender, address } = req.body;

    // Upload image if exists
    let imageUrl = null;
    if (req.files && req.files.profile_photo) {
      imageUrl = await this.uploadToCloudinary(req.files.profile_photo, "patients");
    }

    // Update query
    await this.update(
      `UPDATE users 
       SET name = ?, phone_number = ?, age = ?, gender = ?, address = ?, profile_photo = ?
       WHERE id = ?`,
      [name, phone_number, age, gender, address, imageUrl, patientId]
    );

    this.s = 1;
    this.m = "Profile updated successfully";
    this.r = { id: patientId, name, phone_number, age, gender, address, profile_photo: imageUrl };
    return this.send_res(res);
  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}


async change_pass(req, res, next) {
  try {
    // Check required fields
    if (this.varify_req(req, ["old_pass", "new_pass", "confirm_pass"])) {
      this.s = 0;
      this.m = "old_pass, new_pass, and confirm_pass are required!";
      return this.send_res(res);
    }
    const { old_pass, new_pass, confirm_pass } = req.body;
    // Fetch user password
    const user = await this.selectOne(
      "SELECT password FROM users WHERE id = ?",
      [req._id]
    );
    if (!user) {
      this.s = 0;
      this.m = "User not found!";
      return this.send_res(res);
    }


    // Confirm new password match
    if (new_pass !== confirm_pass) {
      this.s = 0;
      this.m = "New password and confirm password do not match!";
      return this.send_res(res);
    }

    // Check old password
    const isPasswordCorrect = this.check_password(user.password,old_pass); // <-- fixed

    if (!isPasswordCorrect) {
      this.s = 0;
      this.m = "Old password is incorrect!";
      return this.send_res(res);
    }
   

    // Hash new password
    const hashedPassword =await this.generate_password(new_pass);

    // Update password in DB
    await this.update(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req._id]
    );

    this.s = 1;
    this.m = "Password reset successfully!";
    return this.send_res(res);

  } catch (error) {
    console.error(error);
    this.s = 0;
    this.m = "Something went wrong!";
    return this.send_res(res);
  }
}
async allDoctors(req, res, next) {
  try {
    // Doctors table se saare doctors fetch karo
    const doctors = await this.select(
      `SELECT 
         doctor_id, 
         name, 
         email, 
         phone_number, 
         specialization, 
         experience_years, 
         bio, 
         profile_photo, 
         consultation_fee,
         created_at 
       FROM doctors
       ORDER BY created_at DESC`
    );

    if (!doctors || doctors.length === 0) {
      this.s = 0;
      this.m = "No doctors found";
      this.r = [];
      return this.send_res(res);
    }

    this.s = 1;
    this.m = "Doctors fetched successfully";
    this.r = doctors;
    return this.send_res(res);
  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}
async getDoctorById(req, res, next) {
  try {
    const doctorId = req.params.id; // Fetch the doctorId from the URL parameter
    const { date } = req.query; // Fetch the date from the query string (YYYY-MM-DD)

    // Check if doctorId is provided
    if (!doctorId) {
      this.s = 0;
      this.m = "Doctor ID is required";
      return this.send_res(res);
    }

    // 1️⃣ Fetch doctor details
    const doctor = await this.selectOne(
      `SELECT 
         doctor_id, 
         name, 
         email, 
         phone_number, 
         specialization, 
         experience_years, 
         bio, 
         profile_photo, 
         consultation_fee,
         created_at 
       FROM doctors
       WHERE doctor_id = ?`,
      [doctorId]
    );

    if (!doctor) {
      this.s = 0;
      this.m = "Doctor not found";
      return this.send_res(res);
    }

    let slotsWithStatus = [];

    if (date) {
      const dayOfWeek = new Date(date).getDay(); 

      console.log(dayOfWeek)
      const slots = await this.select(
        `SELECT slot_id, slot_time 
         FROM slot_times 
         WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1
         ORDER BY slot_time ASC`,
        [doctorId, dayOfWeek]
      );
      // 3️⃣ Get booked slots for that specific date
      const booked = await this.select(
        `SELECT slot_id 
         FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND status = 'scheduled'`,
        [doctorId, date]
      );

      const bookedSlotIds = booked.map(b => b.slot_id); // Get the IDs of the booked slots

      // 4️⃣ Mark slots as booked or available
      slotsWithStatus = slots.map(s => ({
        slot_id: s.slot_id,
        slot_time: s.slot_time,
        status: bookedSlotIds.includes(s.slot_id) ? 'booked' : 'available'
      }));
    }
    // 5️⃣ Fetch reviews for the doctor
    const review = await this.select(
      "SELECT * FROM reviews WHERE doctor_id = ?",
      [doctor.doctor_id]
    );

    // Send successful response
    this.s = 1;
    this.m = "Doctor fetched successfully";
    this.r = {
      ...doctor,
      slots: slotsWithStatus,
      review
    };
    return this.send_res(res);

  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}

async bookAppointment(req, res, next) {
  try {
    const patientId = req._id;
    const { slot_id, appointment_date } = req.body;

    // Validate request
    if (this.varify_req(req, ["slot_id", "appointment_date"])) {
      this.s = 0;
      this.m = "slot_id and appointment_date are required";
      return this.send_res(res);
    }

    // Validate and format date
    const dateObj = new Date(appointment_date);
    if (isNaN(dateObj.getTime())) {
      this.s = 0;
      this.m = "Invalid appointment_date format. Use YYYY-MM-DD";
      return this.send_res(res);
    }

    // ✅ Compare only the date part
    // const today = new Date();
const today = new Date()
// const todayDate = today.toISOString().split('T')(0)
const todayDate = today.toISOString().split('T')[0];
    const appointmentDateOnly = dateObj.toISOString().split('T')[0];

    if (appointmentDateOnly < todayDate) {
      this.s = 0;
      this.m = "You cannot book an appointment for a past date";
      return this.send_res(res);
    }
    const formattedDate = appointmentDateOnly; // safe to use
    // 1️⃣ Get slot details
    const slot = await this.selectOne(
      "SELECT * FROM slot_times WHERE slot_id = ? AND is_active = 1",
      [slot_id]
    );
    if (!slot) {
      this.s = 0;
      this.m = "Invalid or inactive slot";
      return this.send_res(res);
    }
    // 2️⃣ Check if slot already booked on that date
    const exists = await this.selectOne(
      `SELECT appointment_id FROM appointments
       WHERE slot_id = ? AND appointment_date = ? AND status = 'scheduled'`,
      [slot_id, formattedDate]
    );

    if (exists) {
      this.s = 0;
      this.m = "This slot is already booked on this date";
      return this.send_res(res);
    }
    // 3️⃣ Insert appointment
    const result = await this.insert(
      `INSERT INTO appointments (patient_id, doctor_id, slot_id, appointment_date, status)
       VALUES (?, ?, ?, ?, 'scheduled')`,
      [patientId, slot.doctor_id, slot.slot_id, formattedDate]
    );

    // ✅ Send successful response
    this.s = 1;
    this.m = "Appointment booked successfully";
    this.r = {
      appointment_id: result.insertId,
      doctor_id: slot.doctor_id,
      slot_time: slot.slot_time,
      appointment_date: formattedDate
    };
    return this.send_res(res);

  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}




async getAppointments(req, res, next) {
  try {
    const patientId = req._id;

    const appointments = await this.select(
      `SELECT a.appointment_id, a.appointment_date, a.status,
              s.slot_time, 
              d.doctor_id, d.name as doctor_name, d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN slot_times s ON a.slot_id = s.slot_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, s.slot_time ASC`,
      [patientId]
    );

    this.s = 1;
    this.m = "Appointments fetched successfully";
    this.r = appointments;
    return this.send_res(res);

  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}

async UpdateAppointment(req, res, next) {
  try {
    const patientId = req._id;
    const appId = req.params.id;
    const { doctor_id, slot_id, appointment_date } = req.body;

    if (this.varify_req(req, ["doctor_id", "slot_id", "appointment_date"])) {
      this.s = 0;
      this.m = "Provide doctor_id, slot_id and appointment_date to update";
      return this.send_res(res);
    }

    // Check appointment exists
    const appointment = await this.selectOne(
      "SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?",
      [appId, patientId]
    );
    if (!appointment) {
      this.s = 0;
      this.m = "Appointment not found";
      return this.send_res(res);
    }

    // Validate date format
    const dateObj = new Date(appointment_date);
    if (isNaN(dateObj.getTime())) {
      this.s = 0;
      this.m = "Invalid appointment_date format. Use YYYY-MM-DD";
      return this.send_res(res);
    }
    const formattedDate = dateObj.toISOString().split('T')[0];

    // Check if slot already booked
    const exists = await this.selectOne(
      `SELECT appointment_id FROM appointments 
       WHERE doctor_id = ? AND slot_id = ? AND appointment_date = ? AND status = 'scheduled' AND appointment_id != ?`,
      [doctor_id, slot_id, formattedDate, appId]
    );

    if (exists) {
      this.s = 0;
      this.m = "This slot is already booked";
      return this.send_res(res);
    }

    // Update appointment
    await this.update(
      `UPDATE appointments 
       SET doctor_id = ?, slot_id = ?, appointment_date = ? 
       WHERE appointment_id = ?`,
      [doctor_id, slot_id, formattedDate, appId]
    );

    this.s = 1;
    this.m = "Appointment updated successfully";
    return this.send_res(res);

  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}

async cancelAppointment(req, res, next) {
  try {
    const patientId = req._id;
    const appId = req.params.id;

    // Check appointment exists
    const appointment = await this.selectOne(
      "SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?",
      [appId, patientId]
    );

    if (!appointment) {
      this.s = 0;
      this.m = "Appointment not found";
      return this.send_res(res);
    }

    if (appointment.status === "cancelled") {
      this.s = 0;
      this.m = "Appointment already cancelled";
      return this.send_res(res);
    }

    // Cancel appointment
    await this.update(
      "UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?",
      [appId]
    );

    this.s = 1;
    this.m = "Appointment cancelled successfully";
    return this.send_res(res);

  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}



}
