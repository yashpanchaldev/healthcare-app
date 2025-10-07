import { Router } from "express";
import Admin from "../controller/admin/adminController.js";

const router = Router();

router.route("/add-doctor").post((req, res, next) => {
  const a = new Admin();
  return a.addDoctor(req, res, next);
});

router.route("/update-doctor/:doctor_id").put((req, res, next) => {
  const a= new Admin();
  return a.updateDoctor(req, res, next);
});

router.route("/delete-doctor/:doctor_id").delete((req, res, next) => {
  const a = new Admin();
  return a.deleteDoctor(req, res, next);
});

router.route("/allAppointments").get((req,res,next)=>{
  const a = new Admin()
  return a.AllAppointments(req,res,next);
})
router.route("/medicine/category").post((req, res, next) => {
  const a = new Admin();
  return a.createCategory(req, res, next);
});

router.route("/medicine/category").get((req, res, next) => {
  const a = new Admin();
  return a.getAllCategories(req, res, next);
});

router.route("/medicine/category/:id").get((req, res, next) => {
  const a = new Admin();
  return a.getCategoryById(req, res, next);
});

router.route("/medicine/category/:id").put((req, res, next) => {
  const a = new Admin();
  return a.updateCategory(req, res, next);
});

router.route("/medicine/category/:id").delete((req, res, next) => {
  const a = new Admin();
  return a.deleteCategory(req, res, next);
});
// Medicine CRUD
router.route("/medicine").post((req, res, next) => {
  const a = new Admin();
  return a.createMedicine(req, res, next);
});

router.route("/medicine").get((req, res, next) => {
  const a = new Admin();
  return a.getAllMedicines(req, res, next);
});

router.route("/medicine/:id").get((req, res, next) => {
  const a = new Admin();
  return a.getMedicineById(req, res, next);
});

router.route("/medicine/:id").put((req, res, next) => {
  const a = new Admin();
  return a.updateMedicine(req, res, next);
});

router.route("/medicine/:id").delete((req, res, next) => {
  const a = new Admin();
  return a.deleteMedicine(req, res, next);
});

router.route("/medicine/media/:id").delete((req, res, next) => {
  const a = new Admin();
  return a.mediaDelete(req, res, next);
});

router.route("/medicine/media/:id").put((req, res, next) => {
  const a = new Admin();
  return a.mediaUpdate(req, res, next);
});

router.route("/doctor/slot/:id").post((req, res, next) => {
  const a = new Admin();
  return a.AddDoctorSlot(req, res, next);
});



export default router;
