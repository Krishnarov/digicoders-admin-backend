import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import Registration from "../models/regsitration.js";
import Fee from "../models/fee.js";

export const createOrder = async (req, res) => {
    try {
        const studentId = req.student._id;
        const { amount } = req.body;
        const payAmount = Number(amount);
        const student = await Registration.findById(studentId);
        if (!student)
            return res.status(404).json({ success: false, message: "Student not found" });

        if (payAmount <= 0 || payAmount > student.dueAmount) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount",
            });
        }

        const order = await razorpay.orders.create({
            amount: payAmount * 100, // paise
            currency: "INR",
            receipt: `DCT-${Date.now()}`,
            notes: {
                registrationId: student._id.toString(),
                userid: student.userid,
            },
        });

        res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// export const verifyPayment = async (req, res) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature,
//             amount,
//         } = req.body;
//         const studentId = req.student._id;

//         const body = razorpay_order_id + "|" + razorpay_payment_id;

//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body)
//             .digest("hex");

//         if (expectedSignature !== razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Invalid signature" });
//         }

//         const student = await Registration.findById(studentId);

//         const paidAmount = student.paidAmount + amount;

//         const dueAmount = Math.max(student.dueAmount - payAmount, 0);


//         const fee = await Fee.create({
//             registrationId: student._id,
//             totalFee: student.totalFee,
//             finalFee: student.finalFee,
//             paidAmount,
//             dueAmount,
//             amount,
//             paymentType: "installment",
//             mode: "online",
//             tnxId: razorpay_payment_id,
//             tnxStatus: dueAmount === 0 ? "full paid" : "paid",
//             status: "accepted",
//             paymentStatus: "success",
//             isFullPaid: dueAmount === 0,
//         });

//         student.paidAmount = paidAmount;
//         student.dueAmount = dueAmount;
//         student.trainingFeeStatus = dueAmount === 0 ? "full paid" : "partial";
//         student.tnxStatus = dueAmount === 0 ? "full paid" : "paid";

//         await student.save();

//         res.status(200).json({
//             success: true,
//             message: "Payment successful",
//             fee,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
        } = req.body;

        // 🔐 Signature verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // 🛑 Duplicate payment check
        const existingPayment = await Fee.findOne({ tnxId: razorpay_payment_id });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: "Payment already recorded",
            });
        }

        const studentId = req.student._id;
        const student = await Registration.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const payAmount = Number(amount);

        const updatedPaidAmount = student.paidAmount + payAmount;
        const updatedDueAmount = Math.max(student.dueAmount - payAmount, 0);

        // 🧾 Create fee record
        const fee = await Fee.create({
            registrationId: student._id,
            totalFee: student.totalFee,
            discount: student.discount,
            finalFee: student.finalFee,
            paidAmount: updatedPaidAmount,
            dueAmount: updatedDueAmount,
            amount: payAmount,
            paymentType: "installment",
            mode: "online",
            tnxId: razorpay_payment_id,
            tnxStatus: updatedDueAmount === 0 ? "full paid" : "paid",
            status: "accepted",
            paymentStatus: "success",
            isFullPaid: updatedDueAmount === 0,
        });

        // 🔄 Update student
        student.paidAmount = updatedPaidAmount;
        student.dueAmount = updatedDueAmount;
        student.trainingFeeStatus =
            updatedDueAmount === 0 ? "full paid" : "partial";
        student.tnxStatus =
            updatedDueAmount === 0 ? "full paid" : "paid";

        await student.save();

        res.status(200).json({
            success: true,
            message: "Payment successful",
            fee,
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
