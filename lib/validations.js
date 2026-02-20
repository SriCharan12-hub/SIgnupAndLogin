export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/^[a-zA-Z]/.test(password)) {
    return { isValid: false, message: "Password must start with a letter" };
  }
 
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter (a-z)" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number (0-9)" };
  }
  if (!/[@$!%*?&]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character (@ $ ! % * ? &)",
    };
  }
  return { isValid: true, message: "" };
};
