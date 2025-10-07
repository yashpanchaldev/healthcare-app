import { Router } from "express";
import User from "../controller/user/userController.js";
const router = Router();

router.route("/patients/profile").get((req,res,next)=>{
  const c = new User()
  return c.getProfile(req,res,next);
})
router.route("/patients/profile").put((req,res,next)=>{
  const c = new User()
  return c.updateProfile(req,res,next);
})
router.route("/change_pass").post((req,res,next)=>{
  const c = new User()
  return c.change_pass(req,res,next);
})
router.route("/doctors").get((req,res,next)=>{
  const c = new User()
  return c.allDoctors(req,res,next);
})
router.route("/doctors/:id").get((req,res,next)=>{
  const c = new User()
  return c.getDoctorById(req,res,next);
})

router.route("/appointment/book").post((req,res,next)=>{
  const c = new User()
  return c.bookAppointment(req,res,next);
})
router.route("/appointment").get((req,res,next)=>{
  const c = new User()
  return c.getAppointments(req,res,next);
})
router.route("/appointments/:id").put((req,res,next)=>{
  const c = new User()
  return c.UpdateAppointment(req,res,next);
})
router.route("/appointments/cancel/:id").put((req,res,next)=>{
  const c = new User()
  return c.cancelAppointment(req,res,next);
})



export default router;
