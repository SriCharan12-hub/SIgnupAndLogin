import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

// Short-lived token used ONLY to bridge the two MFA steps (step1 → step2).
// Carries userId so the verify-mfa route knows which user to look up.
export function generateMfaToken(userId) {
  return jwt.sign({ userId, purpose: "mfa" }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
}
