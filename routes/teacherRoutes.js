import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  assignBatchToTeacher,
  deleteTeacher
} from "../controllers/teacherController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

// Teacher CRUD
router.post("/create",auth, createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacherById);
router.delete("/:id", deleteTeacher);

// Extra Logic
router.post("/assign-batch", assignBatchToTeacher);

export default router;
