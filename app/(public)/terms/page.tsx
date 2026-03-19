import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – BookIt",
  description: "BookIt terms of service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to home</Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 19, 2026</p>

        <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using BookIt ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use of the Service</h2>
            <p>BookIt is a platform that connects users with sports courts and salons in Lebanon. You may use the Service to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Browse and discover sports venues and salons</li>
              <li>Book appointments and reserve time slots</li>
              <li>Manage your existing bookings</li>
              <li>List and manage your own business (if you are a business owner)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You must provide accurate information when creating an account
              and keep it up to date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Bookings and Cancellations</h2>
            <p>
              When you make a booking through BookIt, you are entering into an agreement directly with the business.
              Cancellation policies are set by each individual business. BookIt is not responsible for disputes
              between users and businesses regarding bookings, cancellations, or refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Business Listings</h2>
            <p>
              Business owners are responsible for ensuring their listings are accurate, including pricing, availability,
              and service descriptions. BookIt reserves the right to remove listings that violate these terms or
              contain misleading information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to disrupt or harm the Service or other users</li>
              <li>Create multiple accounts to abuse the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              BookIt provides the platform "as is" without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the Service or from transactions between
              users and businesses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the Service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:support@bookit.lb" className="text-blue-600 hover:underline">support@bookit.lb</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
