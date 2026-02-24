export const requestPasswordReset = async (email) => {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to send reset email");
  }
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
};

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

export const loginUser = async (email, password, rememberMe = false) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
};

export const verifyMfa = async (otp, mfaToken, rememberMe = false) => {
  const response = await fetch("/api/auth/verify-mfa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp, mfaToken, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "MFA verification failed");
  }

  return data;
};

export const logoutUser = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return response.json();
};
