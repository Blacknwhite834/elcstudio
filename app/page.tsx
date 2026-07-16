import AboutScene from "./components/scenes/about-scene";
import CreateScene from "./components/scenes/create-scene";
import DarkScene from "./components/scenes/dark-scene";
import FooterReveal from "./components/scenes/footer-reveal";
import JourneyScene from "./components/scenes/journey-scene";
import PricingScene from "./components/scenes/pricing-scene";
import MobileNav from "./components/mobile-nav";
import RollingText from "./components/rolling-text";
import { processSteps, socialExamples, websiteExamples } from "./components/scenes/data";

export default function Home() {
  return (
    <main className="elc-site">
      <nav className="elc-nav" aria-label="Main navigation" data-elc-nav>
        <a className="elc-nav-brand" href="#top" aria-label="Back to top">
          <RollingText>
            elc.studio<span aria-hidden="true" data-brand-copy>©</span>
          </RollingText>
        </a>
        <div className="elc-nav-menu" aria-label="Page sections">
          <a href="#about">
            <RollingText>About</RollingText>
          </a>
          <a href="#method">
            <RollingText>Method</RollingText>
          </a>
          <a href="#subscriptions">
            <RollingText>Subscriptions</RollingText>
          </a>
          <div className="elc-method-indicator" aria-hidden="true" data-method-indicator>
            {processSteps.map((step) => (
              <span key={step.title} data-method-dot />
            ))}
          </div>
        </div>
        <a className="elc-nav-contact" href="#contact">
          <RollingText>Contact</RollingText>
        </a>
      </nav>

      <MobileNav />

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
      <CreateScene />
      <FooterReveal />
    </main>
  );
}
