"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { Rainbow, Leaf, Chrome, Facebook, Instagram } from "lucide-react";
import { signupUser } from "@/services/authService";
import SwipeButton from "@/components/ui/SwipeButton";
import { validatePassword } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Swipe Button Logic
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSwipeComplete = async (reset) => {
    if (loading || isSubmitted) return;

    // Basic Validation before submit
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields to sign up");
      reset();
      return;
    }
    const { isValid, message } = validatePassword(formData.password);
    if (!isValid) {
      toast.error(message);
      reset();
      return;
    }
    if (!formData.terms) {
      toast.error("Please agree to the Terms and Privacy Policy");
      reset();
      return;
    }

    setIsSubmitted(true);
    setLoading(true);
    setError("");

    try {
      await signupUser(formData.email, formData.password);

      // Handle success
      toast.success(
        "Signup successful! Please check your email for verification.",
      );
      router.push("/auth/login"); // Redirect to login page
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
      setIsSubmitted(false);
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4 font-sans">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"
          alt="Toys Background"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-2xl w-full max-w-5xl h-[565px] overflow-hidden flex relative z-10">
        {/* Left Panel - Nature Image & Content */}
        <div className="hidden md:flex flex-col justify-between w-1/2 relative p-8 text-white">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=2069&auto=format&fit=crop"
              alt="Happy Kids"
              className="w-full h-full object-cover rounded-3xl"
            />
            {/* Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 rounded-3xl"></div>
          </div>

          <div className="relative z-10 flex items-center space-x-4 bg-white/95 backdrop-blur-md p-4 rounded-full w-fit mt-4 shadow-xl border border-white/50">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-yellow-100 overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${i + 12}`}
                    alt="Happy Kid"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 tracking-wide drop-shadow-sm">
                JOIN 30k+ HAPPY FAMILIES!
              </p>
              <p className="text-[10px] text-gray-600 font-medium">
                Making playtime magical everyday
              </p>
            </div>
          </div>

          <div className="relative z-10 mb-8">
            <h1 className="text-6xl font-extrabold leading-tight tracking-tight text-orange-400 drop-shadow-lg">
              Join our
              <br />
              fun world.
            </h1>
            <p className="mt-2 text-lg text-gray-100 opacity-90">
              Play, learn, and create every day 🌈
            </p>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-full md:w-1/2 bg-white/0 flex flex-col justify-start px-8 md:px-12 pb-8 pt-0 relative">
          {/* White/Clean curve background effect for right side */}
          <div className="absolute inset-0 bg-white md:rounded-l-[3rem]"></div>

          <div className="relative z-10 max-w-sm mx-auto w-full flex flex-col justify-start">
            {/* Logo */}
            <div className="flex justify-center mb-1">
              <img
                src="https://res.cloudinary.com/sricharan/image/upload/v1771421017/Kiddies_Kingdom_Logo_i2asjy.png"
                alt="Kiddies Kingdom Logo"
                className="w-40 h-auto object-contain" // Further reduced size
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Join us today and get started
              </p>
            </div>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="peer w-full appearance-none bg-transparent border-0 border-b border-gray-200 text-gray-900 focus:ring-0 focus:border-gray-200 transition-colors py-2 px-1 placeholder-transparent"
                    placeholder="Email"
                  />
                  <label className="absolute left-1 top-2 text-gray-400 text-sm transition-all peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 peer-autofill:opacity-0 pointer-events-none">
                    Email
                  </label>
                </div>
              </div>

              <div className="space-y-1 relative">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="peer w-full appearance-none bg-transparent border-0 border-b border-gray-200 text-gray-900 focus:ring-0 focus:border-gray-200 transition-colors py-2 px-1 placeholder-transparent pr-8"
                    placeholder="Password"
                  />
                  <label className="absolute left-1 top-2 text-gray-400 text-sm transition-all peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 peer-autofill:opacity-0 pointer-events-none">
                    Password
                  </label>
                </div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute bottom-2.5 right-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer z-50 scale-125"
                >
                  <Rainbow
                    className={`w-4 h-4 pointer-events-none ${showPassword ? "text-orange-500" : "text-gray-900"} mb-1`}
                  />
                </button>
              </div>

              <div className="flex items-start mt-2 mb-6">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-xs text-gray-600 mt-1"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-500 font-medium"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-500 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Swipe to Submit Button */}
              <SwipeButton
                onSwipeComplete={handleSwipeComplete}
                isLoading={loading}
                label={loading ? "Signing up..." : "Swipe to Sign Up"}
              />
            </form>

            <div className="mt-2 text-center text-xs text-gray-500">
              <p>
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-orange-600 font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

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

                <button className="p-2 border border-blue-100 rounded-full hover:bg-blue-50 transition text-blue-600">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-2 border border-pink-100 rounded-full hover:bg-pink-50 transition text-pink-600">
                  <Instagram className="w-5 h-5" />
                </button>
                <button className="p-2 border border-red-100 rounded-full hover:bg-red-50 transition text-red-600 font-bold text-xs flex items-center justify-center w-[38px] h-[38px]">
                  P
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
