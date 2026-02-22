import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Kiddies Kingdom",
  description: "Read the Terms of Service for Kiddies Kingdom.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-[#333333] text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-2">
            Legal
          </p>
          <h1 className="text-4xl font-serif font-bold">Terms of Service</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Last updated: February 2026
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using any part of the Kiddies Kingdom platform (the
            &quot;Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree to all the terms and conditions, you
            may not access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            2. Account Registration
          </h2>
          <p>
            You must provide accurate, complete, and current information when
            creating an account. You are responsible for maintaining the
            confidentiality of your credentials and for all activities that
            occur under your account. You must notify us immediately of any
            unauthorised use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            3. Acceptable Use
          </h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              regulations.
            </li>
            <li>
              Attempt to gain unauthorised access to any portion of the Service.
            </li>
            <li>Transmit any harmful, offensive, or disruptive content.</li>
            <li>
              Use automated tools to scrape, crawl, or stress-test the platform.
            </li>
            <li>Impersonate any person or entity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            4. Intellectual Property
          </h2>
          <p>
            All content, trademarks, logos, and intellectual property displayed
            on the Service are the property of Kiddies Kingdom or its licensors.
            You may not reproduce, distribute, or create derivative works
            without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            5. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Kiddies Kingdom shall not be
            liable for any indirect, incidental, special, or consequential
            damages arising from your use of, or inability to use, the Service.
            Our total liability shall not exceed the amount you paid us in the
            twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right to update these Terms at any time. We will
            notify registered users of material changes via email or a prominent
            notice on the Service. Continued use of the Service after changes
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            7. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
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
