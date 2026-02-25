import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DigiCoders 👨‍💻" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

// Email template for registration success
export const sendRegistrationSuccessEmail = async (to, data) => {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to DigiCoders</title></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr><td style="background: linear-gradient(135deg, #0d6efd, #0b5ed7); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">DigiCoders</h1><p style="margin: 10px 0 0;">Empowering Future Innovators</p></td></tr>
    <tr><td style="padding: 30px;"><h2 style="color: #333;">Hello ${data.studentName} 👋</h2><p style="color: #555;">Congratulations! Your registration with <strong style="color: #0d6efd;">DigiCoders</strong> is successful. Welcome! 🚀</p>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #0d6efd;"><h3 style="color: #0d6efd; margin-top: 0;">Registration Details</h3>
    <p><strong>Training:</strong> ${data.training}</p><p><strong>Technology:</strong> ${data.technology}</p><p><strong>Total Fee:</strong> ₹${data.totalFee}</p>${data.paidAmount ? `<p><strong>Paid:</strong> ₹${data.paidAmount}</p>` : ''}${data.dueAmount ? `<p><strong>Due:</strong> ₹${data.dueAmount}</p>` : ''}</div>
    <div style="background: #fff8e1; border-radius: 6px; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;"><h4 style="color: #ff8f00; margin-top: 0;">📌 Important</h4><p>Login: UserID: ${data.mobile}, Password: ${data.mobile}</p></div>
    <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
    <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
  </table>
</body>
</html>`;
  await sendEmail(to, "Welcome to DigiCoders!", html);
};

// Email template for payment reminder
export const sendPaymentReminderEmail = async (to, data) => {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Complete Your Payment</title></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr><td style="background: linear-gradient(135deg, #0d6efd, #0b5ed7); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">DigiCoders</h1><p style="margin: 10px 0 0;">Complete Your Registration</p></td></tr>
    <tr><td style="padding: 30px;"><h2 style="color: #333;">Dear ${data.studentName} 👋</h2><p style="color: #555;">Your registration is complete and seat is reserved at <strong style="color: #0d6efd;">DigiCoders</strong>.</p>
    <div style="background: #fff8e1; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #ffc107;"><h3 style="color: #ff8f00; margin-top: 0;">⚠️ Action Required</h3><p>To confirm your seat, please pay the registration fee now.</p></div>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #0d6efd;"><p><strong>Training:</strong> ${data.training}</p><p><strong>Technology:</strong> ${data.technology}</p><p style="font-size: 20px; font-weight: 600; color: #0d6efd;">Registration Fee: ₹${data.amount}</p></div>
    <div style="text-align: center; margin: 30px 0;"><a href="${data.paymentLink}" style="background: #0d6efd; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now ₹${data.amount}</a></div>
    <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
    <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
  </table>
</body>
</html>`;
  await sendEmail(to, "Complete Your DigiCoders Registration Payment", html);
};

// Email template for payment success
export const sendPaymentSuccessEmail = async (to, data) => {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Payment Successful</title></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr><td style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">✅ Payment Successful!</h1><p style="margin: 10px 0 0;">DigiCoders Technologies Pvt. Ltd.</p></td></tr>
    <tr><td style="padding: 30px;"><h2 style="color: #333;">Dear ${data.studentName} 👋</h2><p style="color: #555;">Your payment has been received successfully. Your registration is now confirmed! 🎉</p>
    <div style="background: #d1fae5; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #10b981;"><h3 style="color: #059669; margin-top: 0;">✅ Payment Confirmed</h3><p><strong>Payment ID:</strong> ${data.paymentId}</p><p><strong>Amount Paid:</strong> ₹${data.amount}</p><p><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">PAID</span></p></div>
    <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #0d6efd;"><h3 style="color: #0d6efd; margin-top: 0;">Registration Details</h3><p><strong>Training:</strong> ${data.training}</p><p><strong>Technology:</strong> ${data.technology}</p></div>
    <p style="color: #555;">Welcome to the DigiCoders family! 🚀</p>
    <div style="background: #fff8e1; border-radius: 6px; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;"><h4 style="color: #ff8f00; margin-top: 0;">📌 Important</h4><p>Login: UserID: ${data.mobile}, Password: ${data.mobile}</p></div>
    <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
    <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
  </table>
</body>
</html>`;
  await sendEmail(to, "Payment Successful - Welcome to DigiCoders!", html);
};

// Email template for installment received
export const sendInstallmentReceivedEmail = async (to, data) => {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Installment Received</title></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr><td style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">✅ Installment Received</h1></td></tr>
    <tr><td style="padding: 30px;"><h2 style="color: #333;">Dear ${data.studentName} 👋</h2><p style="color: #555;">Thank you for your payment!</p>
    <div style="background: #d1fae5; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #10b981;"><p><strong>Amount Received:</strong> ₹${data.amount}</p>${data.dueAmount ? `<p><strong>Remaining Due:</strong> ₹${data.dueAmount}</p>` : '<p style="color: #10b981; font-weight: 600;">✅ Fully Paid</p>'}</div>
    <p style="color: #555;">Thank you for the payment. - DigiCoders Technologies Pvt. Ltd.</p>
    <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
    <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
  </table>
</body>
</html>`;
  await sendEmail(to, "Installment Received - DigiCoders", html);
};

// Email template for fee reminder
export const sendFeeReminderEmail = async (to, data) => {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Fee Reminder</title></head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <tr><td style="background: linear-gradient(135deg, #ffc107, #ff8f00); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">⚠️ Payment Reminder</h1></td></tr>
    <tr><td style="padding: 30px;"><h2 style="color: #333;">Dear ${data.studentName} 👋</h2><p style="color: #555;">This is a reminder that your DigiCoders training fee is pending.</p>
    <div style="background: #fff8e1; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #ffc107;"><p style="font-size: 20px; font-weight: 600; color: #ff8f00;">Pending Amount: ₹${data.amount}</p></div>
    ${data.paymentLink ? `<div style="text-align: center; margin: 30px 0;"><a href="${data.paymentLink}" style="background: #ffc107; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Pay Now ₹${data.amount}</a></div>` : ''}
    <p style="color: #555;">Please clear your dues at the earliest to continue your training without interruption.</p>
    <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
    <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
  </table>
</body>
</html>`;
  await sendEmail(to, "Fee Payment Reminder - DigiCoders", html);
}

// Email template for fee reminder
// export const sendFeeReminderEmail = async (to, data) => {
//   const html = `<!DOCTYPE html>
// <html>
// <head><meta charset="UTF-8"><title>Fee Reminder</title></head>
// <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
//   <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
//     <tr><td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 25px; text-align: center; color: #ffffff;"><h1 style="margin: 0;">⚠️ Fee Reminder</h1></td></tr>
//     <tr><td style="padding: 30px;"><h2 style="color: #333;">Dear ${data.studentName} 👋</h2><p style="color: #555;">This is a friendly reminder about your pending training fee at DigiCoders.</p>
//     <div style="background: #fff8e1; border-radius: 6px; padding: 20px; margin: 25px 0; border-left: 4px solid #ffc107;"><h3 style="color: #ff8f00; margin-top: 0;">⚠️ Pending Amount</h3><p style="font-size: 24px; font-weight: 600; color: #d97706;">₹${data.dueAmount}</p><p>Kindly pay the due amount at the earliest.</p></div>
//     <p style="color: #888; font-size: 14px;">Need help? 📧 support@thedigicoders.com | 📞 +91 6394296293</p></td></tr>
//     <tr><td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;"><p style="margin: 0;">&copy; ${new Date().getFullYear()} DigiCoders. All rights reserved.</p></td></tr>
//   </table>
// </body>
// </html>`;
//   await sendEmail(to, "Fee Reminder - DigiCoders", html);
// };
