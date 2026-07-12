import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — elc.studio",
  description: "Privacy policy for elc.studio.",
};

export default function PrivacyPage() {
  return (
    <main className="elc-legal">
      <div className="elc-legal-inner">
        <Link className="elc-legal-back" href="/">
          ← Back to elc.studio
        </Link>
        <h1>Privacy</h1>
        <h2>What we collect</h2>
        <p>
          The contact form on this site collects the name, email address, and project description
          you choose to send us. Nothing else is collected.
        </p>
        <h2>How it is used</h2>
        <p>
          Your message is delivered to us by email and used solely to reply to your request. It is
          never sold, shared, or used for marketing.
        </p>
        <h2>Cookies and tracking</h2>
        <p>
          This site uses no analytics and no tracking cookies. A single technical value is stored
          in your browser&apos;s local storage to skip the intro animation on repeat visits.
        </p>
        <h2>Your rights</h2>
        <p>
          To access, correct, or delete any personal data you have sent us, write to{" "}
          <a href="mailto:contact@elcstudio.net">contact@elcstudio.net</a>.
        </p>
      </div>
    </main>
  );
}
