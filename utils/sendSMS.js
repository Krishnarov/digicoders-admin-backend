import axios from "axios";

export const sendSmsOtp = async (mobile, otp) => {
  const url = "http://sms.digicoders.in/api/sendhttp.php";

  const params = {
    authkey:`${process.env.SMS_API_AUTHKEY}`,
    mobiles: `91${mobile}`,
    message: `Your OTP Code is ${otp}. Do not share it with anyone. From DigiCoders. #TeamDigiCoders`,
    sender: `${process.env.SENDER_ID}`,
    route: 4,
    country: 91,
    DLT_TE_ID: `${process.env.DLT_TE_ID}`,
  };

  try {
    const response = await axios.get(url, { params });

    return response.data;
  } catch (error) {
    console.error("SMS Error:", error.message);
    throw error;
  }
};
export const sendSmsReminder = async (mobile, message) => {
  const url = "http://sms.digicoders.in/api/sendhttp.php";

  const params = {
    authkey: "370038Amo3cZx0h696a3f7dP1",
    mobiles: `91${mobile}`,
    message: message,
    sender: "DIGICO",
    route: 4,
    country: 91,
    DLT_TE_ID: "1307164706435757762",
  };

  try {
    const response = await axios.get(url, { params });

    return response.data;
  } catch (error) {
    console.error("SMS Error:", error.message);
    throw error;
  }
};
