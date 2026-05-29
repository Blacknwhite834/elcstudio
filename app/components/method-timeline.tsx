const timelineSteps = [
  {
    number: "01",
    title: "Discovery",
    text: "Understanding your business, your goals and what your online presence needs to achieve.",
    visual: "/images/photo-33_1photo-33.webp",
    alt: "Discovery moodboard",
  },
  {
    number: "02",
    title: "Client Space",
    text: "Access your private dashboard to complete onboarding and follow every step.",
    visual: "/images/68022ab71504ac81d459a6bf_thumb__ascent.webp",
    alt: "Client dashboard interface",
  },
  {
    number: "03",
    title: "Blueprint",
    text: "Validate the website structure before starting the visual design.",
    visual: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary.webp",
    alt: "Website blueprint screen",
  },
  {
    number: "04",
    title: "Design Preview",
    text: "Review the visual direction through a preview link and share feedback.",
    visual: "/images/Slide-16_9---9.png",
    alt: "Design preview composition",
  },
  {
    number: "05",
    title: "Build & Launch",
    text: "Your website is developed, tested and published.",
    visual: "/images/Building-Wall-Mockup.png",
    alt: "Launch brand mockup",
  },
  {
    number: "06",
    title: "Ongoing Presence",
    text: "After launch, your website keeps evolving with updates or Social Presence.",
    visual: "/images/photo-39_1photo-39.webp",
    alt: "Ongoing online presence visual",
  },
];

type MethodHeroCardProps = {
  number: string;
  title: string;
  text: string;
  visual: string;
  alt: string;
};

function MethodHeroCard({ number, title, text, visual, alt }: MethodHeroCardProps) {
  return (
    <div className="method-hero-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={visual} alt={alt} loading="lazy" decoding="async" className="method-hero-card-img" />
      <div className="method-hero-card-overlay">
        <span className="method-hero-card-num">{number}</span>
        <h3 className="method-hero-card-title">{title}</h3>
        <p className="method-hero-card-text">{text}</p>
      </div>
    </div>
  );
}

const leftSteps = [timelineSteps[0], timelineSteps[2], timelineSteps[4]];
const rightSteps = [timelineSteps[1], timelineSteps[3], timelineSteps[5]];

export function MethodTimeline() {
  return (
    <section id="Method" className="method-hero-section">
      <div className="method-hero-wrapper">
        <div className="method-hero-content">

          <div className="method-hero-title-wrap" aria-hidden="true">
            <p className="method-hero-title">Method°</p>
          </div>

          <div className="method-hero-strip is-left">
            {leftSteps.map((step) => (
              <MethodHeroCard key={step.number} {...step} />
            ))}
          </div>

          <div className="method-hero-strip is-right">
            {rightSteps.map((step) => (
              <MethodHeroCard key={step.number} {...step} />
            ))}
          </div>

          <div className="method-hero-bottom">
            <p className="method-hero-label">A clear process from first idea to a website ready to grow.</p>
            <a href="mailto:contact@elcstudio.net" className="method-hero-cta">
              <span>Let&apos;s Connect</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
