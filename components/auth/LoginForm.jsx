"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {
  Mail,
  Lock,
  Chrome,
  Loader2,
  Facebook,
  Instagram,
  Rainbow,
} from "lucide-react";
import { loginUser, verifyMfa } from "@/services/authService";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // MFA States
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otp, setOtp] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(
        formData.email,
        formData.password,
        formData.rememberMe,
      );

      if (response.mfaPending) {
        setMfaPending(true);
        setMfaToken(response.mfaToken);
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyMfa(otp, mfaToken, formData.rememberMe);
      router.push("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end p-8 md:py-12 md:pl-12 md:pr-4 bg-white">
        <div className="w-full max-w-md space-y-4">
          <div className="mb-4">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              {mfaPending ? "Verify it's you" : "Welcome!"}
            </h1>
            <p className="text-gray-600 font-medium">
              {mfaPending
                ? "We've sent a 6-digit code to your email."
                : "Sign in to"}
            </p>
          </div>

          {mfaPending ? (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 block text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="w-full text-center text-3xl tracking-[1em] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-gray-900 placeholder-gray-300"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#333333] hover:bg-black text-white py-4 px-4 rounded-xl font-semibold transition shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center tracking-wide"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMfaPending(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-4 font-medium"
                >
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-500 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors text-gray-900 placeholder-gray-400 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer z-10"
                  >
                    <Rainbow
                      className={`h-5 w-5 transition-colors ${showPassword ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-lg flex items-center">
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-gray-400 hover:text-gray-600"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#333333] hover:bg-black text-white py-3 px-4 rounded-lg font-medium transition shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center tracking-wide"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>

                {/* Social Logins */}
                <div className="mt-3 flex flex-col items-center space-y-2">
                  <div className="relative w-full text-center border-t border-gray-100 my-2">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-gray-400">
                      or continue with
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"
                      title="Sign in with Google"
                    >
                      <Chrome className="w-5 h-5 text-gray-900" />
                    </button>

                    <button
                      type="button"
                      onClick={() => signIn("facebook", { callbackUrl: "/" })}
                      className="p-2 border border-blue-100 rounded-full hover:bg-blue-50 transition text-blue-600"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => signIn("instagram", { callbackUrl: "/" })}
                      className="p-2 border border-pink-100 rounded-full hover:bg-pink-50 transition text-pink-600"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => signIn("pinterest", { callbackUrl: "/" })}
                      className="p-2 border border-red-100 rounded-full hover:bg-red-50 transition text-red-600 font-bold text-xs flex items-center justify-center w-[38px] h-[38px]"
                    >
                      P
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500 pt-2">
                <p>
                  Don't have an Account ?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-black font-bold hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center relative overflow-hidden">
        {/* Placeholder for the cute illustration shown in image */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-4">
          <img
            src={
              error
                ? "https://res.cloudinary.com/sricharan/image/upload/v1771329351/0ca8cd74-2e34-4c3f-965c-4ba46d007064_ooxndd.png"
                : "https://res.cloudinary.com/sricharan/image/upload/v1771330656/15282905-04dd-47ab-aae9-dba36f911bde_rbpwna.jpg"
            }
            alt="Login Illustration"
            className="mb-8 object-contain w-[70%] h-[80%] opacity-90 mix-blend-multiply transition-opacity duration-500"
            // Fallback / Placeholder logic
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://res.cloudinary.com/sricharan/image/upload/v1771330656/15282905-04dd-47ab-aae9-dba36f911bde_rbpwna.jpg";
            }}
          />
          {/* Overlay to tint if using generic photo */}
        </div>
      </div>
    </div>
  );
}
