import AboutScene from "./components/scenes/about-scene";
import ConnectScene from "./components/scenes/connect-scene";
import DarkScene from "./components/scenes/dark-scene";
import FooterReveal from "./components/scenes/footer-reveal";
import JourneyScene from "./components/scenes/journey-scene";
import PricingScene from "./components/scenes/pricing-scene";
import { processSteps, socialExamples, websiteExamples } from "./components/scenes/data";

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
            {processSteps.map((step) => (
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
            <video autoPlay muted loop playsInline preload="auto" data-hero-video>
              <source src="/videos/hero.webm" type="video/webm" />
            </video>
          </div>
        </div>
        <h1 id="hero-title" className="elc-hero-logo" data-hero-logo>
          <span>elc.studio</span>
          <span className="elc-logo-mark">©</span>
        </h1>
      </section>

      <AboutScene />
      <JourneyScene items={websiteExamples} variant="websites" />
      <JourneyScene items={socialExamples} variant="social" />
      <DarkScene />
      <PricingScene />
      <ConnectScene />
      <FooterReveal />
    </main>
  );
}
