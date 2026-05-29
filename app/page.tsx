import Image from "next/image";
import ContactForm from "./components/contact-form";

type MethodIconName = "search" | "grid" | "structure" | "frame" | "launch" | "presence";

type MethodStep = {
  icon: MethodIconName;
  title: string;
  text: string;
  videoSrc: string;
};

function MethodIcon({ name }: { name: MethodIconName }) {
  const iconProps = {
    "aria-hidden": true,
    className: "elc-method-icon",
    fill: "none",
    focusable: false,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  } as const;

  if (name === "search") {
    return (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "grid") {
    return (
      <svg {...iconProps}>
        <rect x="3.5" y="4" width="17" height="16" rx="3" />
        <path d="M8.5 4v16" />
        <path d="M3.5 10h17" />
        <path d="M12 15h5" />
      </svg>
    );
  }

  if (name === "structure") {
    return (
      <svg {...iconProps}>
        <rect x="8.5" y="3.5" width="7" height="5" rx="1.5" />
        <rect x="3" y="15.5" width="7" height="5" rx="1.5" />
        <rect x="14" y="15.5" width="7" height="5" rx="1.5" />
        <path d="M12 8.5v4" />
        <path d="M6.5 12.5h11" />
        <path d="M6.5 12.5v3" />
        <path d="M17.5 12.5v3" />
      </svg>
    );
  }

  if (name === "frame") {
    return (
      <svg {...iconProps}>
        <path d="M12 3.5a8.5 8.5 0 0 0 0 17h1.2a2 2 0 0 0 1.35-3.48 1.18 1.18 0 0 1 .82-2.02H17a3.5 3.5 0 0 0 3.5-3.5A8 8 0 0 0 12 3.5Z" />
        <circle cx="8.5" cy="10" r=".8" />
        <circle cx="11.8" cy="7.8" r=".8" />
        <circle cx="15.4" cy="10" r=".8" />
      </svg>
    );
  }

  if (name === "launch") {
    return (
      <svg {...iconProps}>
        <path d="M14.5 4.5c2.4-.55 4.15.05 5 .55.5.85 1.1 2.6.55 5-1.05 4.4-5.35 7.15-8.25 8.2l-6.05-6.05c1.05-2.9 3.8-7.2 8.75-7.7Z" />
        <path d="M8.5 15.5 5 19" />
        <path d="M9 8.5H5.8L4 10.3l3.2 1" />
        <path d="M15.5 15v3.2L13.7 20l-1-3.2" />
        <circle cx="15.5" cy="8.5" r="1.4" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M20 12a8 8 0 0 1-13.65 5.65" />
      <path d="M4 12A8 8 0 0 1 17.65 6.35" />
      <path d="M17.5 3.5v3.2h-3.2" />
      <path d="M6.5 20.5v-3.2h3.2" />
      <path d="M9 12h2l1.3-2.5 2.2 5 1.2-2.5H18" />
    </svg>
  );
}

const methodSteps: MethodStep[] = [
  {
    icon: "search",
    title: "Discovery",
    text: "Understanding your business and goals.",
    videoSrc: "/card1.mp4",
  },
  {
    icon: "grid",
    title: "Client space",
    text: "Access your private dashboard to complete onboarding and follow every step.",
    videoSrc: "/card2.mp4",
  },
  {
    icon: "structure",
    title: "Website structure",
    text: "A clear conversion flow, pages, sections and content hierarchy before design starts.",
    videoSrc: "/card3.mp4",
  },
  {
    icon: "frame",
    title: "Visual direction",
    text: "A polished interface direction that feels calm, premium and unmistakably yours.",
    videoSrc: "/card4.mp4",
  },
  {
    icon: "launch",
    title: "Build and launch",
    text: "Responsive development, testing, technical setup and a smooth handoff.",
    videoSrc: "/card5.mp4",
  },
  {
    icon: "presence",
    title: "Ongoing presence",
    text: "Consistent updates, social visuals and refinements that keep your brand visible.",
    videoSrc: "/card6.mp4",
  },
];

const subscriptions = [
  {
    name: "Essential",
    category: "Website",
    price: "99€ / mois",
    description: "Designed for businesses that want clarity, visibility and consistency.",
    videoSrc: "/cardstacked1.mp4",
    features: [
      "Custom website",
      "Mobile responsive",
      "Client dashboard",
      "Basic SEO",
      "3 modifications / mois",
      "Launch setup",
    ],
  },
  {
    name: "Growth",
    category: "Website",
    price: "149€ / mois",
    description: "A stronger digital foundation with more pages, iteration and conversion support.",
    videoSrc: "/cardstacked2.mp4",
    features: [
      "Essential included",
      "Advanced structure",
      "Conversion pages",
      "Quote / booking",
      "5 modifications / mois",
      "Analytics setup",
    ],
  },
  {
    name: "Presence",
    category: "Social",
    price: "299€ / mois",
    description: "Website care and social direction that keep your business active online.",
    videoSrc: "/cardstacked3.mp4",
    features: [
      "Weekly content",
      "4 posts / week",
      "Stories + Reels",
      "Editing",
      "Captions",
      "Publishing",
    ],
  },
];

const calmImages = [
  {
    className: "is-one",
    src: "/images/Frame-15.png",
  },
  {
    className: "is-two",
    src: "/images/Building-Wall-Mockup-p-800.png",
  },
  {
    className: "is-three",
    src: "/images/Lightbox-Sign-Mockup-p-800.png",
  },
  {
    className: "is-four",
    src: "/images/photo-39_1-p-800.webp",
  },
  {
    className: "is-five",
    src: "/images/Slide-16_9---9-p-800.png",
  },
  {
    className: "is-six",
    src: "/images/Hanging-Duct-Tape-Mockup-p-800.png",
  },
  {
    className: "is-seven",
    src: "/images/Building-Wall-Mockup-p-800.png",
  },
  {
    className: "is-eight",
    src: "/images/photo-39_1-p-800.webp",
  },
  {
    className: "is-nine",
    src: "/images/Lightbox-Sign-Mockup-p-800.png",
  },
  {
    className: "is-ten",
    src: "/images/Slide-16_9---9-p-800.png",
  },
  {
    className: "is-eleven",
    src: "/images/Frame-15.png",
  },
  {
    className: "is-twelve",
    src: "/images/Hanging-Duct-Tape-Mockup-p-800.png",
  },
];

export default function Home() {
  return (
    <main className="elc-site">
      <nav className="elc-nav" aria-label="Main navigation" data-elc-nav>
        <a className="elc-nav-brand" href="#top" aria-label="Back to top">
          elc.studio<span aria-hidden="true">©</span>
        </a>
        <div className="elc-nav-menu" aria-label="Page sections">
          <a href="#about">About</a>
          <a href="#method">Method</a>
          <a href="#subscriptions">Subscriptions</a>
          <div className="elc-method-indicator" aria-hidden="true" data-method-indicator>
            {methodSteps.map((step) => (
              <span key={step.title} data-method-dot />
            ))}
          </div>
        </div>
        <a className="elc-nav-contact" href="#contact">
          Contact
        </a>
      </nav>

      <section id="top" className="elc-hero" aria-labelledby="hero-title" data-hero-section>
        <div className="elc-hero-phone" aria-hidden="true" data-hero-phone>
          <div data-hero-phone-inner>
            <video autoPlay muted loop playsInline>
              <source src="/video.webm" type="video/webm" />
              <source src="/video.webm" type="video/quicktime" />
            </video>
          </div>
        </div>
        <h1 id="hero-title" className="elc-hero-logo" data-hero-logo>
          <span>elc.studio</span>
          <span className="elc-logo-mark">©</span>
        </h1>
      </section>

      <section id="about" className="elc-intro" aria-labelledby="intro-title">
        <h2 id="intro-title" className="elc-sr-only">
          About elc.studio
        </h2>
        <p className="elc-intro-text" data-split-reveal>
          elc.studio© builds high-converting websites, client spaces, and consistent
          online presence for local businesses - creating clean, premium digital
          experiences designed to help brands look professional, stay visible, and
          turn visitors into clients.
        </p>
      </section>

      <section id="method" className="elc-method" aria-labelledby="method-title" data-method-section>
        <div className="elc-method-viewport">
          <div className="elc-method-track" data-method-track>
            <div className="elc-method-title" data-method-title>
              <h2 id="method-title">
                This is our <span>Method</span>
              </h2>
            </div>
            {methodSteps.map((step) => (
              <article className="elc-method-card" key={step.title} data-method-card>
                <div className="elc-method-media" aria-hidden="true">
                  {step.videoSrc ? (
                    <video muted loop playsInline preload="metadata" data-method-video>
                      <source src={step.videoSrc} type="video/mp4" />
                    </video>
                  ) : null}
                </div>
                <div className="elc-method-copy">
                  <h3>
                    <MethodIcon name={step.icon} />
                    {step.title}
                  </h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="subscriptions"
        className="elc-subscriptions"
        aria-labelledby="subscriptions-title"
        data-subscriptions-section
      >
        <h2 id="subscriptions-title" className="elc-subscriptions-title" data-stack-heading>
          <span>One process.</span> Three subscriptions. A complete digital presence built
          to attract, convert, and stay visible
        </h2>

        <div className="elc-stack" aria-label="Subscription options" data-stack>
          {subscriptions.map((subscription, index) => (
            <article
              className={`elc-sub-card${index === 0 ? " is-stack-active" : ""}`}
              key={subscription.name}
              data-stack-card
            >
              <div className="elc-sub-card-media">
                <video muted loop playsInline preload="metadata" aria-hidden="true" data-stack-video>
                  <source src={subscription.videoSrc} type="video/mp4" />
                </video>
                <ul
                  className="elc-sub-card-features"
                  aria-label={`${subscription.name} included features`}
                >
                  {subscription.features.map((feature) => (
                    <li data-feature-chip key={feature}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="elc-sub-card-copy">
                <p>Subscription {subscription.category}</p>
                <h3>{subscription.name}</h3>
                <strong className="elc-sub-card-price">{subscription.price}</strong>
                <span>{subscription.description}</span>
                <a href="#contact">Learn more</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="elc-calm" aria-labelledby="calm-title" data-calm-section>
        <div className="elc-calm-gallery" aria-hidden="true" data-calm-gallery>
          {calmImages.map((image, index) => (
            <div className={`elc-float-card ${image.className}`} data-float-card key={`${image.className}-${image.src}`}>
              <Image
                src={image.src}
                alt=""
                width={index % 2 === 0 ? 560 : 640}
                height={index % 2 === 0 ? 560 : 480}
                sizes="(max-width: 768px) 48vw, 340px"
              />
            </div>
          ))}
        </div>

        <h2 id="calm-title" className="elc-calm-title" data-calm-title>
          <span className="elc-calm-soft" data-calm-soft data-calm-base>
            A calmer way to build
          </span>{" "}
          <span className="elc-calm-strong" data-calm-strong data-calm-rest>
            your presence online.
          </span>
        </h2>
      </section>

      <section id="contact" className="elc-cta" aria-labelledby="contact-title" data-cta-section>
        <div className="elc-cta-panel" data-cta-panel>
          <div className="elc-cta-top">
            <div className="elc-cta-copy" data-cta-item>
              <h2 id="contact-title">Ready to elevate your online presence?</h2>
              <p>Based in France</p>
            </div>

            <ContactForm />
          </div>

          <div className="elc-cta-meta" aria-label="Contact details">
            <div data-cta-item>
              <span>Response</span>
              <strong>24-48h</strong>
            </div>
            <div data-cta-item>
              <span>Email</span>
              <strong>
                <a href="mailto:contact@elcstudio.net">contact@elcstudio.net</a>
              </strong>
            </div>
            <div data-cta-item>
              <span>Focus</span>
              <strong>Websites + social presence</strong>
            </div>
          </div>

          <div className="elc-cta-watermark" aria-hidden="true">
            <span>elc.studio</span>
            <span>©</span>
          </div>
        </div>
      </section>
    </main>
  );
}
