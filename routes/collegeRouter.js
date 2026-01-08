// import express from 'express';
// import { getCollegeNames, addCollegeName, updataCollage, deleteCollage } from '../controllers/collegeController.js';
// import { auth } from '../middleware/auth.js';

// const router = express.Router();
// router.use(auth);

// // Get college names for datalist
// router.get('/', getCollegeNames);

// // Add new college name
// router.post('/', addCollegeName);
// router.delete('/:id',deleteCollage);
// router.put('/:id',updataCollage);

// export default router;


import express from 'express';
import { 
  getAllColleges,
  getCollegeNames,
  getCollegeById,
  addCollege,
  updateCollege,
  deactivateCollege,
  reactivateCollege,
  deleteCollege,
  getCollegesByState,
  getFilters
} from '../controllers/collegeController.js';
import { auth } from '../middleware/auth.js';


const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Optional: Add role-based middleware if needed
// import { authorize } from '../middleware/authorize.js';
// router.use(authorize(['admin', 'super-admin']));

// Get all colleges with filtering, searching, and sorting
router.get('/', getAllColleges);

// Get college names for datalist (simplified)
router.get('/names', getCollegeNames);

// Get single college by ID
router.get('/:id', getCollegeById);

// Add new college
router.post('/', addCollege);

// Update college
router.put('/:id', updateCollege);
router.patch('/:id', updateCollege); // Alternative for partial updates

// College status management (soft delete)
router.patch('/:id/deactivate', deactivateCollege);
router.patch('/:id/reactivate', reactivateCollege);

// Hard delete college (permanent deletion)
router.delete('/:id', deleteCollege);

// Get colleges by state
router.get('/state/:state', getCollegesByState);

// Get unique filter options (states, districts, courses)
router.get('/data/filters', getFilters);

export default router;