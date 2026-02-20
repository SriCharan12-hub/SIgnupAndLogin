"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { sendResetOtp, verifyResetOtp, updateUserPassword } from "@/services/authService";
import { validatePassword } from "@/lib/validations";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendResetOtp(email);
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        await verifyResetOtp(email, otp);
        toast.success("OTP Verified!");
        setStep(3);
    } catch (error) {
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { isValid, message } = validatePassword(newPassword);
    if (!isValid) {
      toast.error(message);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await updateUserPassword(newPassword);
      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-500 text-sm">
                {step === 1 && "Enter your email to receive an OTP."}
                {step === 2 && "Enter the OTP sent to your email."}
                {step === 3 && "Create a new strong password."}
            </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 text-black pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="john@example.com"
                    />
                </div>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center transition disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Enter OTP</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-10 text-black pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition tracking-widest"
                        placeholder="123456"
                    />
                </div>
            </div>
             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center transition disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify OTP"}
            </button>
             <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
                Change Email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleVerifyReset} className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
                <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center transition disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
            </button>
          </form>
        )}

        {/* Back Link */}
        <div className="text-center mt-4">
             <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
             </Link>
        </div>

      </div>
    </div>
  );
}
