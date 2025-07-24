import express from 'express';
import { 
  addRegistration, 
  getAllRegistrations, 
  getRegistration, 
  updateRegistration, 
  updateRegistrationStatus, 
  deleteRegistration ,
  getOneRegistrations
} from '../controllers/registrationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', addRegistration);

router.get('/get/user/:username', auth, getOneRegistrations);

// Admin routes (admin authentication required)
router.get('/all', auth, getAllRegistrations);


router.get('/user/:id', auth, getRegistration);

router.put('/user/:id', auth, updateRegistration);

router.patch('/status/:id', auth, updateRegistrationStatus);

router.delete('/user/:id', auth, deleteRegistration);

export default router;