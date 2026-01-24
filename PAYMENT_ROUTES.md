// Add these routes to your main routes file

import { handlePaymentWebhook, handlePaymentCallback } from './controllers/registrationController.js';

// Webhook route (add before body parser middleware)
app.post('/api/webhook/razorpay', express.raw({type: 'application/json'}), handlePaymentWebhook);

// Payment callback route
app.get('/api/payment/callback', handlePaymentCallback);

// Environment variables needed:
// RAZORPAY_KEY_ID=your_key_id
// RAZORPAY_KEY_SECRET=your_key_secret  
// FRONTEND_URL=http://localhost:3000