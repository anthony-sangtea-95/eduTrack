import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAllUsers, createUser } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUser);

export default router;
