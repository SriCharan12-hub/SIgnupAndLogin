"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/services/authService";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end p-8 md:py-12 md:pl-12 md:pr-4 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
              Forgot password?
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <h2 className="font-semibold text-gray-800 text-lg">
                Check your inbox
              </h2>
              <p className="text-sm text-gray-500">
                If <span className="font-medium text-gray-700">{email}</span> is
                registered, you&apos;ll receive a password reset link shortly.
                The link expires in <strong>1 hour</strong>.
              </p>
              <Link
                href="/auth/login"
                className="mt-2 text-sm font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#333333] hover:bg-black text-white py-3 px-4 rounded-lg font-medium transition shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center tracking-wide"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-black font-bold hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right panel illustration */}
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-4">
          <img
            src="https://res.cloudinary.com/sricharan/image/upload/v1771330656/15282905-04dd-47ab-aae9-dba36f911bde_rbpwna.jpg"
            alt="Forgot Password Illustration"
            className="mb-8 object-contain w-[70%] h-[80%] opacity-90 mix-blend-multiply"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://res.cloudinary.com/sricharan/image/upload/v1771330656/15282905-04dd-47ab-aae9-dba36f911bde_rbpwna.jpg";
            }}
          />
        </div>
      </div>
    </div>
  );
}
