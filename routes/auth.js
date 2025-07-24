import express from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '../middleware/auth.js';
// import { registerValidation, loginValidation } from '../middleware/validation.js';
import {
  register,
  login,
  logout
} from '../controllers/authControllers.js';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again later' }
});

// Public routes
router.post('/register', register);
router.post('/login', authLimiter,  login);
router.post('/logout',auth,  logout);


export default router;
