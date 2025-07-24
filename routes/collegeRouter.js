import express from 'express';
import { getCollegeNames, addCollegeName } from '../controllers/collegeController.js';

const router = express.Router();

// Get college names for datalist
router.get('/', getCollegeNames);

// Add new college name
router.post('/', addCollegeName);

export default router;