import { Base } from "../../service/base.js";

export default class AdminController extends Base {
    constructor() {
        super();
    }

    // Add a new doctor
async addDoctor(req, res, next) {
  try {
    const adminId = req._id;

    // ✅ 1. Check admin role
    const checkRole = await this.selectOne("SELECT user_type FROM users WHERE id = ?", [adminId]);
    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can add doctors";
      return this.send_res(res);
    }

    // ✅ 2. Extract doctor data
    const {
      name,
      email,
      phone_number,
      specialization,
      experience_years,
      bio,
      consultation_fee
    } = req.body;

    if (
      this.varify_req(req, [
        "name",
        "email",
        "phone_number",
        "specialization",
        "experience_years",
        "bio",
        "consultation_fee"
      ])
    ) {
      this.s = 0;
      this.m = "All fields are required";
      return this.send_res(res);
    }

    // ✅ 3. Upload image (if provided)
    let imageUrl = null;
    if (req.files && req.files.profile_photo) {
      imageUrl = await this.uploadToCloudinary(req.files.profile_photo, "doctors");
    }

    // ✅ 4. Check duplicate doctor
    const doctorExists = await this.selectOne("SELECT * FROM Doctors WHERE email = ?", [email]);
    if (doctorExists) {
      this.s = 0;
      this.m = "Doctor with this email already exists";
      return this.send_res(res);
    }

    // ✅ 5. Insert new doctor
    const result = await this.insert(
      `INSERT INTO Doctors 
      (name, email, phone_number, specialization, experience_years, bio, profile_photo, consultation_fee) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone_number,
        specialization,
        experience_years,
        bio,
        imageUrl,
        consultation_fee
      ]
    );

    this.s = 1;
    this.m = "Doctor added successfully";
    this.r = {
      doctor_id: result,
      name,
      email,
      phone_number,
      specialization,
      experience_years,
      bio,
      consultation_fee,
      profile_photo: imageUrl
    };
    return this.send_res(res);
  } catch (error) {
    this.s = 0;
    this.err = error.message;
    return this.send_res(res);
  }
}



        async updateDoctor(req, res, next) {
        try {
            const adminId = req._id;
            const checkRole = await this.selectOne("SELECT user_type FROM users WHERE id = ?", [adminId]);

            if (checkRole?.user_type !== "admin") {
                this.s = 0;
                this.m = "Only admin can update doctors";
                return this.send_res(res);
            }

            const { doctor_id } = req.params;
            const {
                name,
                email,
                phone_number,
                specialization,
                experience_years,
                bio,
                profile_photo,
                consultation_fee
            } = req.body;

            // Check doctor exists
            const doctor = await this.selectOne("SELECT * FROM Doctors WHERE doctor_id = ?", [doctor_id]);
            if (!doctor) {
                this.s = 0;
                this.m = "Doctor not found";
                return this.send_res(res);
            }

            // Update query
            await this.update(
                `UPDATE Doctors 
                 SET name = ?, email = ?, phone_number = ?, specialization = ?, 
                     experience_years = ?, bio = ?, profile_photo = ?, consultation_fee = ? 
                 WHERE doctor_id = ?`,
                [name, email, phone_number, specialization, experience_years, bio, profile_photo, consultation_fee, doctor_id]
            );

            this.s = 1;
            this.m = "Doctor updated successfully";
            return this.send_res(res);

        } catch (error) {
            this.s = 0;
            this.err = error.message;
            return this.send_res(res);
        }
    }

    // Delete doctor
    async deleteDoctor(req, res, next) {
        try {
            const adminId = req._id;
            const checkRole = await this.selectOne("SELECT user_type FROM users WHERE id = ?", [adminId]);

            if (checkRole?.user_type !== "admin") {
                this.s = 0;
                this.m = "Only admin can delete doctors";
                return this.send_res(res);
            }

            const { doctor_id } = req.params;

            // Check doctor exists
            const doctor = await this.selectOne("SELECT * FROM Doctors WHERE doctor_id = ?", [doctor_id]);
            if (!doctor) {
                this.s = 0;
                this.m = "Doctor not found";
                return this.send_res(res);
            }

            // Delete doctor
            await this.delete("DELETE FROM Doctors WHERE doctor_id = ?", [doctor_id]);

            this.s = 1;
            this.m = "Doctor deleted successfully";
            return this.send_res(res);

        } catch (error) {
            this.s = 0;
            this.err = error.message;
            return this.send_res(res);
        }
    }


    async AddDoctorSlot(req, res, next) {
  try {
    const adminid = req._id;
    const doctor_id = req.params.id;

    // Check admin role
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminid]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can add doctor slots";
      return this.send_res(res);
    }

    if (this.varify_req(req, ["days", "startHour", "endHour"])) {
      this.s = 0;
      this.m = "days, startHour, endHour are required";
      return this.send_res(res);
    }

    const {  startHour, endHour } = req.body;
    const startHourNum = Number(startHour);
    const endHourNum = Number(endHour);
    const days = JSON.parse(req.body.days);

    // days: array of weekdays (example: [1,3,5] = Monday, Wednesday, Friday)
    for (let d of days) {
      // console.log(d)
      for (let hour = startHourNum; hour <= endHourNum; hour++) {
        await this.insert(
        // console.log(hour)
          "INSERT INTO slot_times (doctor_id, day_of_week, slot_time, is_active) VALUES (?,?,?,1)",
          [doctor_id, d, `${hour}:00:00`]
        );
      }
    }

    this.s = 1;
    this.m = "Doctor slots created successfully";
    return this.send_res(res);

  } catch (error) {
    this.err = error.message;
    return this.send_res(res);
  }
}


async AllAppointments(req, res, next) {
  try {
    const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }

    // Get all appointments
    let appointments = await this.select(
      "SELECT appointment_id, patient_id, doctor_id, appointment_utc, status FROM appointments"
    );

    // Attach doctor and patient details for each appointment
    for (let ele of appointments) {
      ele.doctorDetails = await this.selectOne(
        "SELECT doctor_id, name, specialization, email, phone_number FROM doctors WHERE doctor_id = ?",
        [ele.doctor_id]
      );

      ele.patient = await this.selectOne(
        "SELECT id, name, email, phone_number FROM users WHERE id = ?",
        [ele.patient_id]
      );
    }

    this.s = 1;
    this.m = "Fetch data successfully";
    this.r = appointments;
    return this.send_res(res);

  } catch (error) {
    this.err = error.message;
    return this.send_res(res);
  }
}

  async createCategory(req, res, next) {
    try {
        const { category_name } = req.body;
         const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }

        if (this.varify_req(req, ["category_name"])) {
            this.s = 0;
            this.m = "Category name required";
            return this.send_res(res);
        }

        

        // check if category already exists
        const existCate = await this.selectOne(
            "SELECT category_id FROM medicinecategories WHERE category_name = ?",
            [category_name]
        );
        if (existCate) {
            this.s = 0;
            this.m = "Category already exists";
            this.r = existCate;
            return this.send_res(res);
        }

        const result = await this.insert(
            "INSERT INTO medicinecategories (category_name) VALUES (?)",
            [category_name]
        );

        this.s = 1;
        this.m = "Category created successfully";
        this.d = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async getAllCategories(req, res, next) {
    try {
         const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }

        const result = await this.select("SELECT * FROM medicinecategories");
        this.s = 1;
        this.m = "Categories fetched successfully";
        this.r = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async getCategoryById(req, res, next) {
    try {
        const { id } = req.params;
         const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }

        const result = await this.selectOne(
            "SELECT * FROM medicinecategories WHERE category_id = ?",
            [id]
        );

        if (!result) {
            this.s = 0;
            this.m = "Category not found";
            return this.send_res(res);
        }

        this.s = 1;
        this.m = "Category fetched successfully";
        this.r = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async updateCategory(req, res, next) {
    try {
        const { id } = req.params;
         const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );
        const { category_name } = req.body;


    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }


        if (this.varify_req(req, ["category_name"])) {
            this.s = 0;
            this.m = "Category name required";
            return this.send_res(res);
        }

               const existCate = await this.selectOne(
            "SELECT category_id FROM medicinecategories WHERE category_id = ?",
            [id]
        );
        if (!existCate) {
            this.s = 0;
            this.m = "Category Not exists";
            this.r = existCate;
            return this.send_res(res);
        }

        

        const result = await this.update(
            "UPDATE medicinecategories SET category_name = ? WHERE category_id = ?",
            [category_name, id]
        );

        if (result.affectedRows === 0) {
            this.s = 0;
            this.m = "Category not found";
            return this.send_res(res);
        }

        this.s = 1;
        this.m = "Category updated successfully";
        this.d = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async deleteCategory(req, res, next) {
    try {
        const { id } = req.params;
         const adminId = req._id;
    const checkRole = await this.selectOne(
      "SELECT user_type FROM users WHERE id = ?",
      [adminId]
    );

    if (checkRole?.user_type !== "admin") {
      this.s = 0;
      this.m = "Only admin can view all appointments";
      return this.send_res(res);
    }

        const result = await this.delete(
            "DELETE FROM medicinecategories WHERE category_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            this.s = 0;
            this.m = "Category not found";
            return this.send_res(res);
        }

        this.s = 1;
        this.m = "Category deleted successfully";
        this.d = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}




async createMedicine(req, res, next) {
  try {
    const {
      name,
      description,
      category_id,
      size,
      price,
      discount_price,
      stock,
      rating,
      prescription_required
    } = req.body;

    // ✅ Validation
    if (this.varify_req(req, ["name", "category_id", "price"])) {
      this.s = 0;
      this.m = "Name, category_id and price are required";
      return this.send_res(res);
    }

    // // ✅ Insert into medicines
    const medicineResult = await this.insert(
      `INSERT INTO medicines 
      (name, description, category_id, size, price, discount_price, stock, rating, prescription_required) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        category_id,
        size,
        price,
        discount_price,
        stock,
        rating,
        prescription_required
      ]
    );
    const medicineId = medicineResult;

    // ✅ Upload and insert multiple images
    let mediaResults = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images]; // ensure array


      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // upload to cloudinary (or local if you prefer)
        const imageUrl = await this.uploadToCloudinary(file, "medicines");

        const mediaResult = await this.insert(
          "INSERT INTO medicine_media (medicine_id, media_url, is_primary) VALUES (?, ?, ?)",
          [medicineId, imageUrl, i === 0 ? 1 : 0] // mark first image as primary
        );

        mediaResults.push({ media_id: mediaResult, url: imageUrl });
      }
    }

    this.s = 1;
    this.m = "Medicine created successfully";
    this.r = {
      medicine_id: medicineId,
      name,
      description,
      category_id,
      size,
      price,
      discount_price,
      stock,
      rating,
      prescription_required,
      images: mediaResults
    };
    return this.send_res(res);

  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}
async getAllMedicines(req, res, next) {
    try {
        // Step 1: fetch all medicines with category name
        const medicines = await this.select(
            `SELECT m.*, c.category_name
             FROM medicines m
             LEFT JOIN medicinecategories c ON m.category_id = c.category_id`
        );

        if (!medicines || medicines.length === 0) {
            this.s = 0;
            this.m = "No medicines found";
            this.r = [];
            return this.send_res(res);
        }
        // Step 2: for each medicine, fetch related media
        for (let med of medicines) {
            med.media = await this.select(
                `SELECT media_id, media_url, is_primary
                 FROM medicine_media
                 WHERE medicine_id = ? `,
                [med.medicine_id]
            );
            
        }
        this.s = 1;
        this.m = "Medicines fetched successfully";
        this.r = medicines;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}


async getMedicineById(req, res, next) {
    try {
        const { id } = req.params;

        // Step 1: fetch medicine + category
        const medicine = await this.selectOne(
            `SELECT m.*, c.category_name 
             FROM medicines m 
             LEFT JOIN medicinecategories c ON m.category_id = c.category_id
             WHERE m.medicine_id = ?`,
            [id]
        );

        if (!medicine) {
            this.s = 0;
            this.m = "Medicine not found";
            return this.send_res(res);
        }

        // Step 2: fetch media for this medicine
        const media = await this.select(
            `SELECT media_id, media_url, is_primary
             FROM medicine_media
             WHERE medicine_id = ?`,
            [id]
        );

        medicine.media = media; // attach media array

        this.s = 1;
        this.m = "Medicine fetched successfully";
        this.r = medicine;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async updateMedicine(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category_id,
      size,
      price,
      discount_price,
      stock,
      rating,
      prescription_required
    } = req.body;

    // ✅ Update main medicine fields
    const result = await this.update(
      `UPDATE medicines 
       SET name=?, description=?, category_id=?, size=?, price=?, discount_price=?, stock=?, rating=?, prescription_required=? 
       WHERE medicine_id=?`,
      [name, description, category_id, size, price, discount_price, stock, rating, prescription_required, id]
    );

    if (result.affectedRows === 0) {
      this.s = 0;
      this.m = "Medicine not found";
      return this.send_res(res);
    }
    // ✅ Handle uploaded media files
    let mediaResults = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      // Optional: Remove old media if you want to replace completely
      // await this.delete("DELETE FROM medicine_media WHERE medicine_id = ?", [id]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await this.uploadToCloudinary(file, "medicines");

        const mediaResult = await this.insert(
          "INSERT INTO medicine_media (medicine_id, media_url, is_primary) VALUES (?, ?, ?)",
          [id, imageUrl, i === 0 ? 1 : 0] // first uploaded image as primary
        );

        mediaResults.push({ media_id: mediaResult, url: imageUrl });
      }
    }
    // ✅ Fetch all media for this medicine after update
    const allMedia = await this.select(
      "SELECT media_id, media_url, is_primary FROM medicine_media WHERE medicine_id = ?",
      [id]
    );
    this.s = 1;
    this.m = "Medicine updated successfully";
    this.r = {
      medicine_id: id,
      name,
      description,
      category_id,
      size,
      price,
      discount_price,
      stock,
      rating,
      prescription_required,
      images: allMedia
    };
    return this.send_res(res);

  } catch (err) {
    this.s = 0;
    this.err = err.message;
    return this.send_res(res);
  }
}

async deleteMedicine(req, res, next) {
    try {
        const { id } = req.params;

        // ✅ First delete all media associated with this medicine
        await this.delete(
            "DELETE FROM medicine_media WHERE medicine_id = ?",
            [id]
        );

        // ✅ Then delete the medicine itself
        const result = await this.delete(
            "DELETE FROM medicines WHERE medicine_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            this.s = 0;
            this.m = "Medicine not found";
            return this.send_res(res);
        }
        this.s = 1;
        this.m = "Medicine and its media deleted successfully";
        this.d = result;
        return this.send_res(res);

    } catch (err) {
        this.s = 0;
        this.err = err.message;
        return this.send_res(res);
    }
}

async mediaDelete(req, res, next) {
    try {
        const { id } = req.params; // media_id

        // 1️⃣ Fetch the media to know its medicine_id and if it's primary
        const media = await this.selectOne(
            "SELECT * FROM medicine_media WHERE media_id = ?",
            [id]
        );
        if (!media) {
            this.s = 0;
            this.m = "Media not found";
            return this.send_res(res);
        }
        const medicineId = media.medicine_id;
        const wasPrimary = media.is_primary;

        // 2️⃣ Delete the media
        const result = await this.delete(
            "DELETE FROM medicine_media WHERE media_id = ?",
            [id]
        );
        // 3️⃣ If deleted media was primary, set another media as primary
        if (wasPrimary) {
            const nextMedia = await this.selectOne(
                "SELECT media_id FROM medicine_media WHERE medicine_id = ? LIMIT 1",
                [medicineId]
            );
            if (nextMedia) {
                await this.update(
                    "UPDATE medicine_media SET is_primary = 1 WHERE media_id = ?",
                    [nextMedia.media_id]
                );
            }
        }

        this.s = 1;
        this.m = "Media deleted successfully";
        this.r = result;
        return this.send_res(res);

    } catch (error) {
        this.s = 0;
        this.err = error.message;
        return this.send_res(res);
    }
}
async mediaUpdate(req, res, next) {
  try {
      const { id } = req.params; // media_id
      const { is_primary } = req.body;

      // 1️⃣ Fetch existing media to get medicine_id
      const media = await this.selectOne(
          "SELECT * FROM medicine_media WHERE media_id = ?",
          [id]
      );

      if (!media) {
          this.s = 0;
          this.m = "Media not found";
          return this.send_res(res);
      }

      const medicineId = media.medicine_id;
      let mediaUrl = media.media_url;

      // 2️⃣ If new file uploaded, replace media_url
      if (req.files && req.files.media) {
          mediaUrl = await this.uploadToCloudinary(req.files.media, "medicines");
      }

      // 3️⃣ If marking this media as primary, reset others
      if (is_primary == 1) {
          await this.update(
              "UPDATE medicine_media SET is_primary = 0 WHERE medicine_id = ?",
              [medicineId]
          );
      }

      // 4️⃣ Update the media record
      const result = await this.update(
          `UPDATE medicine_media
           SET media_url = ?, is_primary = COALESCE(?, is_primary)
           WHERE media_id = ?`,
          [mediaUrl, is_primary, id]
      );

      this.s = 1;
      this.m = "Media updated successfully";
      this.r = { media_id: id, media_url: mediaUrl, is_primary: is_primary || media.is_primary };
      return this.send_res(res);

  } catch (error) {
      this.s = 0;
      this.err = error.message;
      return this.send_res(res);
  }
}



}
