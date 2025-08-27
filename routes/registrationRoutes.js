import express from 'express';
import { 
  addRegistration, 
  getAllRegistrations, 
  getRegistration, 
  updateRegistration, 
  updateRegistrationStatus, 
  deleteRegistration ,
  getOneRegistrations,
  sendmail,
  login
} from '../controllers/registrationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', addRegistration);
router.post('/sendmail', sendmail);
router.post('/login',login)
router.get('/get/user/:username', auth, getOneRegistrations);

// Admin routes (admin authentication required)
router.get('/all', auth, getAllRegistrations);

router.get('/user', auth, getRegistration);

router.patch('/update/:id', auth, updateRegistration);

router.patch('/status/:id', auth, updateRegistrationStatus);

router.delete('/user/:id', auth, deleteRegistration);

export default router;