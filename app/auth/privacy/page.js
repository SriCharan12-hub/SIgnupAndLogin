import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Kiddies Kingdom",
  description: "Read the Privacy Policy for Kiddies Kingdom.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-[#333333] text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-2">
            Legal
          </p>
          <h1 className="text-4xl font-serif font-bold">Privacy Policy</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Last updated: February 2026
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            1. Information We Collect
          </h2>
          <p className="mb-3">When you use Kiddies Kingdom, we may collect:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>
              <strong>Account data:</strong> your email address and (hashed)
              password when you register directly.
            </li>
            <li>
              <strong>OAuth data:</strong> your name, email, and profile picture
              when you sign in with Google or other social providers.
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, actions taken, and
              timestamps — used solely to improve the Service.
            </li>
            <li>
              <strong>Device data:</strong> browser type, operating system, and
              IP address for security and rate-limiting purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>To create and manage your account.</li>
            <li>To authenticate you securely on each visit.</li>
            <li>
              To send transactional emails (email verification, password reset).
            </li>
            <li>
              To protect the platform from abuse (rate limiting, lockout).
            </li>
            <li>To comply with applicable legal obligations.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            3. Cookies & Tokens
          </h2>
          <p>
            We use <strong>httpOnly cookies</strong> to store authentication
            tokens. These cookies are inaccessible to client-side JavaScript,
            which protects them from XSS attacks. Session cookies expire when
            you close your browser; persistent cookies (enabled by
            &quot;Remember Me&quot;) expire after 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            4. Third-Party Services
          </h2>
          <p>
            We use the following third-party services, each governed by their
            own privacy policies:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mt-3">
            <li>
              <strong>Google OAuth</strong> — for social sign-in (
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Google Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>Supabase / PostgreSQL</strong> — for secure data storage.
            </li>
            <li>
              <strong>Nodemailer / Gmail SMTP</strong> — for transactional
              emails.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            5. Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active or
            as needed to provide you with the Service. You may request deletion
            of your account and associated data at any time by contacting us.
            Verification and password-reset tokens are automatically purged once
            used or expired.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            6. Your Rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal data, or to restrict or object to
            its processing. To exercise these rights, please write to us at the
            address below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            7. Contact Us
          </h2>
          <p>
            For privacy-related questions or requests, contact our team at{" "}
            <a
              href="mailto:customer_care@kiddieskingdom.co.in"
              className="text-orange-600 hover:underline font-medium"
            >
              customer_care@kiddieskingdom.co.in
            </a>
            .
          </p>
        </section>

        <div className="border-t border-gray-100 pt-8 flex items-center justify-between text-sm text-gray-400">
          <p>© 2026 Kiddies Kingdom. All rights reserved.</p>
          <Link
            href="/auth/signup"
            className="text-orange-600 hover:underline font-medium"
          >
            ← Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
