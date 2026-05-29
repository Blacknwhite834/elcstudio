const offers = [
  {
    number: "01",
    title: "Essential Website",
    text: "Clean, professional online presence built to convert.",
    visual: "/images/68022ab71504ac81d459a6bf_thumb__ascent.webp",
    included: ["Custom website", "Mobile responsive", "Client dashboard", "Basic SEO", "Monthly updates"],
    cta: "Request Essential",
    subject: "Essential Website",
  },
  {
    number: "02",
    title: "Growth Website",
    text: "Designed to generate more enquiries and real business actions.",
    visual: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary.webp",
    included: ["Everything in Essential", "Advanced structure", "Quote or booking", "Conversion pages", "Priority support"],
    cta: "Request Growth",
    subject: "Growth Website",
  },
  {
    number: "03",
    title: "Social Presence",
    text: "Stay active and visible every week — fully handled.",
    visual: "/images/photo-39_1photo-39.webp",
    included: ["Daily activity", "4 posts / week", "Stories + Reels", "Editing", "Captions + publishing"],
    cta: "Request Social Presence",
    subject: "Social Presence",
    accent: true,
  },
];

type SubHeroCardProps = (typeof offers)[number];

function SubHeroCard({ number, title, text, visual, included, cta, subject, accent }: SubHeroCardProps) {
  const href = `mailto:contact@elcstudio.net?subject=${encodeURIComponent(subject)}`;
  return (
    <div className={`sub-hero-card${accent ? " is-social" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={visual} alt="" loading="lazy" decoding="async" className="sub-hero-card-img" />
      <div className="sub-hero-card-overlay">
        <span className="sub-hero-card-num">{number}</span>
        <h3 className="sub-hero-card-title">{title}</h3>
        <p className="sub-hero-card-text">{text}</p>
        <ul className="sub-hero-card-list" aria-label={`${title} includes`}>
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a href={href} className="sub-hero-card-cta">
          <span>{cta}</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

export function SubscriptionsSection() {
  return (
    <section className="sub-hero-section" aria-labelledby="sub-hero-title-label">
      <div className="sub-hero-wrapper">
        <div className="sub-hero-content">

          <div className="sub-hero-title-wrap" aria-hidden="true">
            <p className="sub-hero-title">Subscriptions°</p>
          </div>

          {/* Left strip — Essential + Growth */}
          <div className="sub-hero-strip is-left">
            <SubHeroCard {...offers[0]} />
            <SubHeroCard {...offers[1]} />
          </div>

          {/* Right strip — Social Presence */}
          <div className="sub-hero-strip is-right">
            <SubHeroCard {...offers[2]} />
          </div>

          <div className="sub-hero-bottom">
            <h2 id="sub-hero-title-label" className="sub-hero-heading">Build your presence°</h2>
            <p className="sub-hero-sub">One process. Three ways to keep growing.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
