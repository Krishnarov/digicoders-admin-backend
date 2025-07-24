// routes/feeRoutes.js
import express from "express";
import {
  recordPayment,
  getPaymentHistory,
  checkDues,
  getallPayments,
  changeStatus,
  getFeeById
} from "../controllers/feeController.js";
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.post("/",auth, recordPayment);
router.get("/:registrationId/history",auth, getPaymentHistory);
router.get("/:registrationId/dues",auth, checkDues);
router.get("/",auth, getallPayments);
router.get("/:id", getFeeById);
router.patch("/status/:id",auth, changeStatus);

export default router;