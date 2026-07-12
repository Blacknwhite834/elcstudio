"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ArrowIcon from "../arrow-icon";
import { pricingPlans } from "./data";

const TRANSITION = 1.1;
const HOLD = 0.7;

export default function PricingScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-pricing-stage]");
      const plans = gsap.utils.toArray<HTMLElement>("[data-pricing-plan]", root);
      if (!stage || plans.length === 0) return;

      const parts = plans.map((plan) => ({
        eyebrow: plan.querySelector<HTMLElement>("[data-el-eyebrow]"),
        desc: plan.querySelector<HTMLElement>("[data-el-desc]"),
        title: plan.querySelector<HTMLElement>("[data-el-title]"),
        price: plan.querySelector<HTMLElement>("[data-el-price]"),
        features: gsap.utils.toArray<HTMLElement>("[data-el-features] li", plan),
        media: plan.querySelector<HTMLElement>("[data-el-media]"),
      }));

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          parts.forEach((part, index) => {
            const isFirst = index === 0;
            gsap.set(part.eyebrow, { autoAlpha: isFirst ? 1 : 0, y: isFirst ? 0 : 26 });
            gsap.set(part.desc, { autoAlpha: isFirst ? 1 : 0, y: isFirst ? 0 : 22 });
            gsap.set(part.title, { yPercent: isFirst ? 0 : 112 });
            gsap.set(part.price, { yPercent: isFirst ? 0 : 116 });
            gsap.set(part.features, { autoAlpha: isFirst ? 1 : 0, y: isFirst ? 0 : 18 });
            gsap.set(part.media, { autoAlpha: isFirst ? 1 : 0 });
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=260%" : "+=320%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          tl.to({}, { duration: 0.5 });

          for (let step = 0; step < plans.length - 1; step += 1) {
            const at = 0.5 + step * (TRANSITION + HOLD);
            const current = parts[step];
            const next = parts[step + 1];
            const enterAt = at + 0.35;

            // Current content exits upward in a short cascade…
            tl.to(current.eyebrow, { autoAlpha: 0, duration: 0.4, y: -26 }, at)
              .to(current.desc, { autoAlpha: 0, duration: 0.4, y: -22 }, at + 0.04)
              .to(current.title, { duration: 0.5, yPercent: -112 }, at + 0.08)
              .to(current.price, { duration: 0.5, yPercent: -116 }, at + 0.12)
              .to(
                current.features,
                { autoAlpha: 0, duration: 0.3, stagger: 0.035, y: -16 },
                at + 0.05,
              )
              .to(current.media, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, at + 0.1);

            // …while the next state enters from the opposite direction.
            tl.to(next.eyebrow, { autoAlpha: 1, duration: 0.45, y: 0 }, enterAt + 0.05)
              .to(next.desc, { autoAlpha: 1, duration: 0.45, y: 0 }, enterAt + 0.09)
              .to(next.title, { duration: 0.55, yPercent: 0 }, enterAt + 0.1)
              .to(next.price, { duration: 0.55, yPercent: 0 }, enterAt + 0.14)
              .to(
                next.features,
                { autoAlpha: 1, duration: 0.35, stagger: 0.04, y: 0 },
                enterAt + 0.12,
              )
              .to(next.media, { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, enterAt + 0.1);
          }

          tl.to({}, { duration: 0.5 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="pricing-title" className="elc-pricing" id="subscriptions" ref={rootRef}>
      <h2 className="elc-sr-only" id="pricing-title">
        Subscriptions
      </h2>
      <div className="elc-pricing-stage" data-pricing-stage>
        <div className="elc-pricing-shell">
          <div aria-hidden="true" className="elc-pricing-panel is-left" />
          <div aria-hidden="true" className="elc-pricing-panel is-head" />
          <div aria-hidden="true" className="elc-pricing-panel is-features" />

          {pricingPlans.map((plan) => (
            <div className="elc-pricing-plan" data-pricing-plan key={plan.title}>
              <p className="elc-pricing-eyebrow" data-el-eyebrow>
                {plan.eyebrow}
              </p>
              <div className="elc-pricing-media" data-el-media>
                <video
                  data-motion-video
                  loop
                  muted
                  playsInline
                  poster={plan.posterSrc}
                  preload="none"
                >
                  <source src={plan.videoMp4Src} type="video/mp4" />
                  <source src={plan.videoWebmSrc} type="video/webm" />
                </video>
              </div>
              <p className="elc-pricing-desc" data-el-desc>
                {plan.description}
              </p>
              <div className="elc-pricing-title-clip">
                <h3 className="elc-pricing-title" data-el-title>
                  {plan.title}
                </h3>
              </div>
              <div className="elc-pricing-price-clip">
                <strong className="elc-pricing-price" data-el-price>
                  {plan.price}
                </strong>
              </div>
              <ul className="elc-pricing-features" data-el-features>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true" className="elc-feature-dot" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <span aria-hidden="true" className="elc-pricing-period">
            / Month
          </span>
          <a className="elc-pill elc-pricing-cta" href="#contact">
            Book now
            <ArrowIcon className="elc-pill-icon" />
          </a>
        </div>
      </div>
    </section>
  );
}
