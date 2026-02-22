"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let title = "Login Failed";
  let errorMessage = "An unknown error occurred.";

  if (error === "auth_failed") {
    errorMessage = "Authentication failed. Google did not return a valid code.";
  } else if (error === "database_error") {
    errorMessage = "A database error occurred during sign in.";
  } else if (error === "missing_token") {
    title = "Verification Failed";
    errorMessage = "The verification link is invalid (missing token).";
  } else if (error === "invalid_token") {
    title = "Verification Failed";
    errorMessage = "The verification link is invalid or has already been used.";
  } else if (error === "token_expired") {
    title = "Verification Failed";
    errorMessage =
      "The verification link has expired. Please request a new one.";
  } else if (error === "server_error") {
    title = "Error";
    errorMessage = "A server error occurred. Please try again later.";
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      <Link
        href="/auth/login"
        className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition"
      >
        Try Again
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
