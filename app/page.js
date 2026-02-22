"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService";
import { LogOut, ShieldCheck, User } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Redirect to login page after clearing all session cookies
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <ShieldCheck className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Authenticated!
          </h1>
          <p className="text-gray-500 font-medium">
            You have successfully accessed a protected route.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-3 text-gray-700 bg-gray-50 py-3 px-4 rounded-xl border border-gray-100">
            <User className="w-5 h-5 text-gray-400" />
            <span className="font-semibold">Protected Session Active</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout Everything</span>
        </button>

        <p className="text-xs text-gray-400 pt-2 italic">
          This logout clears both custom JWTs and Google OAuth session cookies.
        </p>
      </div>
    </div>
  );
}
