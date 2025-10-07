import { Router } from "express";
import reviewController from "../controller/review/reviewController.js";

const router = Router();

// Add review
router.post("/", (req, res, next) => {
  const c = new reviewController();
  return c.addReview(req, res, next);
});

// Update review
router.put("/:id", (req, res, next) => {
  const c = new reviewController();
  return c.updateReview(req, res, next);
});

// Delete review
router.delete("/:id", (req, res, next) => {
  const c = new reviewController();
  return c.deleteReview(req, res, next);
});

// Get all reviews for a doctor
router.get("/doctor/:id", (req, res, next) => {
  const c = new reviewController();
  return c.getDoctorReviews(req, res, next);
});

export default router;
