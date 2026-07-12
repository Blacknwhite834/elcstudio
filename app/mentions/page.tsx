import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — elc.studio",
  description: "Legal notice for elc.studio.",
};

export default function MentionsPage() {
  return (
    <main className="elc-legal">
      <div className="elc-legal-inner">
        <Link className="elc-legal-back" href="/">
          ← Back to elc.studio
        </Link>
        <h1>Mentions légales</h1>
        <h2>Publisher</h2>
        <p>
          This website is published by elc.studio, a digital studio building websites, client
          spaces, and social presence for local businesses.
        </p>
        <h2>Contact</h2>
        <p>
          <a href="mailto:contact@elcstudio.net">contact@elcstudio.net</a>
        </p>
        <h2>Hosting</h2>
        <p>
          Hosting provider details are available on request at{" "}
          <a href="mailto:contact@elcstudio.net">contact@elcstudio.net</a>.
        </p>
        <h2>Intellectual property</h2>
        <p>
          All content on this site — texts, visuals, and design — is the property of elc.studio
          unless stated otherwise, and may not be reproduced without prior written consent.
        </p>
      </div>
    </main>
  );
}
