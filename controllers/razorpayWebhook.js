import crypto from "crypto";
import Registration from "../models/regsitration.js";
import Fee from "../models/fee.js";

export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // 🔐 Verify signature
        const razorpaySignature = req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (razorpaySignature !== expectedSignature) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid webhook signature" });
        }

        // Parse payload
        const payload = JSON.parse(req.body.toString());
        const event = payload.event;

        // We only care about successful payment
        if (event !== "payment.captured") {
            return res.status(200).json({ success: true });
        }

        const payment = payload.payload.payment.entity;

        const razorpayPaymentId = payment.id;
        const amount = payment.amount / 100; // paise → rupees
        const registrationId = payment.notes.registrationId;

        // 🔁 Retry-safe: already processed?
        const alreadyExists = await Fee.findOne({
            tnxId: razorpayPaymentId,
        });

        if (alreadyExists) {
            return res.status(200).json({ success: true });
        }

        const student = await Registration.findById(registrationId);

        if (!student) {
            return res
                .status(404)
                .json({ success: false, message: "Student not found" });
        }

        const updatedPaid = student.paidAmount + amount;
        const updatedDue = Math.max(student.dueAmount - amount, 0);

        // 🧾 Create Fee record
        await Fee.create({
            registrationId: student._id,
            totalFee: student.totalFee,
            discount: student.discount,
            finalFee: student.finalFee,
            paidAmount: updatedPaid,
            dueAmount: updatedDue,
            amount,
            paymentType: "installment",
            mode: "online",
            tnxId: razorpayPaymentId,
            tnxStatus: updatedDue === 0 ? "full paid" : "paid",
            paymentStatus: "success",
            status: "accepted",
            isFullPaid: updatedDue === 0,
        });

        // 🔄 Update student
        student.paidAmount = updatedPaid;
        student.dueAmount = updatedDue;
        student.trainingFeeStatus =
            updatedDue === 0 ? "full paid" : "partial";
        student.tnxStatus =
            updatedDue === 0 ? "full paid" : "paid";

        await student.save();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ success: false });
    }
};
