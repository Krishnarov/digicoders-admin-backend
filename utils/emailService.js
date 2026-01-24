// utils/emailService.js mein add karo
export const sendPaymentLinkEmail = async (registration, paymentLink) => {
    const emailContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #0d6efd; color: white; padding: 12px 24px; 
          text-decoration: none; border-radius: 5px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Complete Your Registration Payment</h2>
        <p>Dear ${registration.studentName},</p>
        <p>Your registration with DigiCoders has been created successfully.</p>
        <p>Please complete your payment by clicking the button below:</p>
        <a href="${paymentLink.short_url}" class="button">Pay Now</a>
        <p>Payment Link: ${paymentLink.short_url}</p>
        <p>Amount: ₹${registration.finalFee}</p>
        <p>This link will expire in 30 minutes.</p>
      </div>
    </body>
  </html>
  `;

    await sendEmail(
        registration.email,
        "Complete Your DigiCoders Payment",
        emailContent
    );
};
export const sendPaymentConfirmationEmail = async (registration, payment) => {
    const emailContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Payment Successful!</h2>
        <p class="success">✅ Your payment has been received successfully.</p>
        <p>Details:</p>
        <ul>
          <li>Student: ${registration.studentName}</li>
          <li>Amount: ₹${payment.amount / 100}</li>
          <li>Transaction ID: ${payment.id}</li>
          <li>Date: ${new Date(payment.created_at * 1000).toLocaleString()}</li>
        </ul>
        <p>Thank you for completing your payment.</p>
      </div>
    </body>
  </html>
  `;

    await sendEmail(
        registration.email,
        "Payment Successful - DigiCoders",
        emailContent
    );
};