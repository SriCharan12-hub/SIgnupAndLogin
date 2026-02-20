import { supabase } from "@/lib/supabase/client";



export const signupUser = async (email, password) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log("Signup API Response:", { status: response.status, data });

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
};



export const sendResetOtp = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return true;
};

export const verifyResetOtp = async (email, otp) => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });
  if (error) throw error;
  return true;
};

export const updateUserPassword = async (password) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return true;
};
