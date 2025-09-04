// routes/feeRoutes.js
import express from "express";
import {
  recordPayment,
  getPaymentHistory,
  checkDues,
  getallPayments,
  changeStatus,
  getFeeById,deleteFeeData
} from "../controllers/feeController.js";
import { auth } from '../middleware/auth.js';
const router = express.Router();
// router.use(auth);

router.post("/",auth, recordPayment);
router.get("/:registrationId/history", getPaymentHistory);
router.get("/:registrationId/dues", checkDues);
router.get("/", getallPayments);
router.get("/:id", getFeeById);
router.patch("/status/:id",auth, changeStatus);
router.delete("/delete/:id",auth, deleteFeeData);

export default router;