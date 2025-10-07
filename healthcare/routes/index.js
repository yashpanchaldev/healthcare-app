import { authMiddleware } from "../middleware/auth.js";
import { Router } from "express";
import Auth from "./auth.js";
import User from "./user.js";
import Admin from "./admin.js";
import cart from "./cart.js";
import review from "./review.js"
const router = Router();

// without middleware routes
router.use("/auth", Auth);

// with middleware routes
router.use(authMiddleware);
router.use("/user", User);
router.use("/admin", Admin);
router.use("/cart",cart)
router.use("/review",review)
export default router;
