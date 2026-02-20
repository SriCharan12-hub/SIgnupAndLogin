"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizing login...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("AuthCallback: Checking URL...", window.location.href);

        // 1. Check if Supabase has a session (handles #access_token automatically)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("AuthCallback: Session retrieved:", session?.user?.email);
        if (error) console.error("AuthCallback: Session Error:", error);

        if (error) throw error;

        if (!session) {
          // Manual check for hash parameters to help debug
          if (window.location.hash) {
            console.log("AuthCallback: Hash present:", window.location.hash);
            // Give it a moment for Supabase to parse the hash
            await new Promise((r) => setTimeout(r, 500));
            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();
            if (retrySession) {
              console.log("AuthCallback: Session found on retry");
              return handleSuccess(retrySession);
            }
          }

          throw new Error("No session found. Please try again.");
        }

        if (session) {
          await handleSuccess(session);
        }
      } catch (err) {
        console.error("Auth Callback Error:", err);
        // Show detailed error to user for debugging
        toast.error(err.message);
        // Delay redirect so user can see the error
        // router.push("/auth/error?error=auth_failed");
        setMessage("Login Failed: " + err.message);
      }
    };

    const handleSuccess = async (session) => {
      setMessage("Syncing with database...");
      const user = session.user;

      // 2. Call our backend to sync user to the custom PostgreSQL DB
      const response = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          provider: "google",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync user");
      }

      // 3. Success! Redirect to home
      toast.success("Login successful!");
      router.push("/");
      router.refresh();
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">{message}</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Please wait while we set up your account.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Debug: Check console for details
        </p>
      </div>
    </div>
  );
}
