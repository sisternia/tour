const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const registerUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: userData.username,
        email: userData.email,
        password: userData.password,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Register API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const verifyOTP = async (email: string, otp: string, purpose: 'verify_account' | 'reset_password') => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, purpose }),
    });
    return await response.json();
  } catch (error) {
    console.error("Verify API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const resetPassword = async (email: string, newPass: string) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password: newPass }),
    });
    return await response.json();
  } catch (error) {
    console.error("Reset Password API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const resendOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    console.error("Resend API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const loginUser = async (loginData: any) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: loginData.username,
        password: loginData.password,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Login API Error:", error);
    return { success: false, message: "Lỗi kết nối Server" };
  }
};

export const checkEmailAndSendOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Lỗi kết nối Server" };
  }
};