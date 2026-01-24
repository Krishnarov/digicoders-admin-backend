// Add this route to your registration routes file

import { verifyPaymentLink } from '../controllers/registrationController.js';

// Payment verification route
router.post('/verify-payment-link', verifyPaymentLink);

// This route should be added to your existing registration routes
// Example: /api/registration/verify-payment-link