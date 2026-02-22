"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
