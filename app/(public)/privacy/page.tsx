import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – BookIt",
  description: "BookIt privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 19, 2026</p>

        <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              When you create an account on BookIt, we collect your name and email address. When you make a booking,
              we store the booking details (business, service, date, and time) linked to your account. If you sign in
              with Google, we receive your name, email address, and profile picture from Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Create and manage your account</li>
              <li>Process and confirm your bookings</li>
              <li>Send booking confirmations and reminders</li>
              <li>Allow businesses to manage their bookings</li>
              <li>Improve our platform and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
            <p>
              We share your name and contact information with the business you book with so they can manage your
              appointment. We do not sell your personal information to third parties. We may share data with service
              providers (such as our hosting provider) only as necessary to operate BookIt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Retention</h2>
            <p>
              We retain your account information as long as your account is active. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Security</h2>
            <p>
              We use industry-standard security measures to protect your information. Passwords are hashed and never
              stored in plain text. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. To exercise these rights,
              please contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@bookit.lb" className="text-blue-600 hover:underline">support@bookit.lb</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
