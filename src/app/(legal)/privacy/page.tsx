import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        &larr; Back to home
      </Link>

      <article className="prose dark:prose-invert mt-8 max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: March 16, 2026
        </p>

        <h2>1. Introduction</h2>
        <p>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our
          service.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as your name,
          email address, and payment information. We also automatically collect
          certain information about your device and usage of the service.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide and maintain the service,
          process transactions, send you related communications, and improve our
          platform. We may also use your information for analytics and to
          personalize your experience.
        </p>

        <h2>4. Data Storage</h2>
        <p>
          Your data is stored on secure servers and protected using
          industry-standard encryption. We retain your personal information only
          for as long as necessary to fulfill the purposes outlined in this
          policy.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          We may employ third-party companies and services to facilitate our
          service, provide the service on our behalf, or assist us in analyzing
          how our service is used. These third parties have access to your
          information only to perform tasks on our behalf.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to access,
          correct, or delete your personal data. You may also have the right to
          object to or restrict certain processing of your data. Contact us to
          exercise these rights.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the date at the top.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at support@example.com.
        </p>
      </article>
    </div>
  );
}
