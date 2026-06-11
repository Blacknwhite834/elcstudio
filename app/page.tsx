const contactDetails = [
  {
    label: "Email",
    value: "contact@elcstudio.net",
    href: "mailto:contact@elcstudio.net",
  },
  {
    label: "Base",
    value: "France",
  },
  {
    label: "Response",
    value: "24-48h",
  },
];

export default function Home() {
  return (
    <main className="elc-coming-soon">
      <section className="elc-business-card" aria-labelledby="coming-title">
        <div className="elc-card-topline">
          <span>elc.studio©</span>
          <a href="mailto:contact@elcstudio.net">contact@elcstudio.net</a>
        </div>

        <div className="elc-card-main">
          <p className="elc-card-kicker">Digital studio</p>
          <h1 id="coming-title">
            elc.studio<span aria-hidden="true">©</span>
          </h1>
          <p>
            Websites, client spaces and social presence for local businesses.
          </p>
          <a className="elc-card-cta" href="mailto:contact@elcstudio.net">
            Write to the studio
          </a>
        </div>

        <div className="elc-card-footer" aria-label="Contact details">
          {contactDetails.map((detail) => (
            <div className="elc-contact-pill" key={detail.label}>
              <span>{detail.label}</span>
              {detail.href ? (
                <a href={detail.href}>{detail.value}</a>
              ) : (
                <strong>{detail.value}</strong>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
