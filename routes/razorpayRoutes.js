import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createOrder,
    verifyPayment,verifyPaymentLink
} from "../controllers/razorpayController.js";

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/verify-payment-link", verifyPaymentLink);

export default router;
