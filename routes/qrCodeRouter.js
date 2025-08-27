import express from "express";
import { createQrCode, getAllQrCodes, getQrCodeById ,deleteQrCode,updataQrCode} from "../controllers/qrCodeController.js";
import upload from "../config/multer.js";
const router = express.Router();
router.post('/',upload.single("image"),createQrCode)
router.get('/',getAllQrCodes)
router.get('/:id',getQrCodeById)
router.delete('/:id',deleteQrCode)
router.put('/:id',upload.single("image"),updataQrCode)

export default router

