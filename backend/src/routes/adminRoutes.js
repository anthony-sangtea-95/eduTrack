import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAllUsers, createUser, getTestTypes, createTestType } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.get("/test-types", getTestTypes);
router.post("/test-types", createTestType);

export default router;
