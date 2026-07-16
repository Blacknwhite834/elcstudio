"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ArrowIcon from "../arrow-icon";
import RollingText from "../rolling-text";
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
      const line = root.querySelector<HTMLElement>("[data-price-line]");
      const ok = root.querySelector<HTMLElement>("[data-price-ok]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-price-dot]", root);
      const question = root.querySelector<HTMLElement>("[data-price-question]");
      const slot = root.querySelector<HTMLElement>("[data-price-slot]");
      const shell = root.querySelector<HTMLElement>("[data-price-shell]");
      const period = root.querySelector<HTMLElement>("[data-price-period]");
      const plans = gsap.utils.toArray<HTMLElement>("[data-pricing-plan]", root);
      if (!stage || !line || !ok || !question || !slot || !shell || plans.length === 0) return;

      const parts = plans.map((plan) => ({
        eyebrow: plan.querySelector<HTMLElement>("[data-el-eyebrow]"),
        desc: plan.querySelector<HTMLElement>("[data-el-desc]"),
        title: plan.querySelector<HTMLElement>("[data-el-title]"),
        price: plan.querySelector<HTMLElement>("[data-el-price]"),
        features: gsap.utils.toArray<HTMLElement>("[data-el-features] li", plan),
        media: plan.querySelector<HTMLElement>("[data-el-media]"),
      }));

      // FLIP geometry, measured from clean layout rects with transforms reset.
      // The mini state IS the real shell scaled down to the sentence slot.
      let okX = 0;
      let fullX = 0;
      let miniX = 0;
      let miniY = 0;
      let miniScale = 0.1;
      const measure = () => {
        gsap.set(line, { x: 0 });
        gsap.set(shell, { scale: 1, x: 0, y: 0 });
        const stageR = stage.getBoundingClientRect();
        const okR = ok.getBoundingClientRect();
        const qR = question.getBoundingClientRect();
        const slotR = slot.getBoundingClientRect();
        const shellR = shell.getBoundingClientRect();
        const stageCenter = stageR.left + stageR.width / 2;
        okX = stageCenter - (okR.left + okR.width / 2);
        // Center the visible text (through the question); the slot hangs to
        // the right so the mini sits just right-of-center before it grows.
        fullX = stageCenter - (okR.left + qR.right) / 2;
        // Min-fit keeps the mini undistorted: exact on desktop (slot matches
        // the shell aspect), contained within the slot on mobile.
        miniScale = Math.min(slotR.width / shellR.width, slotR.height / shellR.height);
        miniX = slotR.left + slotR.width / 2 + fullX - (shellR.left + shellR.width / 2);
        miniY = slotR.top + slotR.height / 2 - (shellR.top + shellR.height / 2);
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          gsap.set(shell, { autoAlpha: 0, transformOrigin: "50% 50%" });
          gsap.set(ok, { autoAlpha: 0, yPercent: 60 });
          gsap.set(dots, { autoAlpha: 0, scale: 1.4, yPercent: 80 });
          gsap.set(question, { autoAlpha: 0, yPercent: 55 });
          if (period) gsap.set(period, { autoAlpha: 0 });

          parts.forEach((part, index) => {
            gsap.set([part.eyebrow, part.desc], { autoAlpha: 0, y: 24 });
            gsap.set(part.title, { yPercent: 112 });
            gsap.set(part.price, { yPercent: 116 });
            gsap.set(part.features, { autoAlpha: 0, y: 18 });
            // Plan 1's media stays visible so the mini reads as a real card.
            gsap.set(part.media, { autoAlpha: index === 0 ? 1 : 0 });
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=340%" : "+=440%",
              invalidateOnRefresh: true,
              onRefreshInit: measure,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // ---- sentence: slow, readable, with holds between phases --------
          tl.fromTo(line, { x: () => okX }, { duration: 0.01, x: () => okX }, 0).to(
            ok,
            { autoAlpha: 1, duration: 0.6, ease: "power2.out", yPercent: 0 },
            0,
          );
          dots.forEach((dot, index) => {
            tl.to(
              dot,
              { autoAlpha: 1, duration: 0.3, ease: "power3.out", scale: 1, yPercent: 0 },
              1.0 + index * 0.18,
            );
          });
          tl.addLabel("question", 1.9)
            .to(line, { duration: 0.5, ease: "power1.inOut", x: () => fullX }, "question")
            .to(question, { autoAlpha: 1, duration: 0.5, ease: "power2.out", yPercent: 0 }, "question+=0.1");

          // ---- mini: the real shell pops in at the slot -------------------
          tl.addLabel("mini", 2.9).fromTo(
            shell,
            { autoAlpha: 0, scale: () => miniScale * 0.85, x: () => miniX, y: () => miniY },
            {
              autoAlpha: 1,
              duration: 0.45,
              ease: "power3.out",
              scale: () => miniScale,
              x: () => miniX,
              y: () => miniY,
            },
            "mini",
          );

          // ---- morph: same shell grows to the centered card ---------------
          tl.addLabel("morph", 3.6)
            .to(shell, { duration: 1.35, ease: "power2.inOut", scale: 1, x: 0, y: 0 }, "morph")
            .to(line, { autoAlpha: 0, duration: 0.6, ease: "power1.in", yPercent: -14 }, "morph+=0.3");

          // Plan 1 content settles as the card reaches full size.
          const revealAt = 4.45;
          tl.to([parts[0].eyebrow, parts[0].desc], { autoAlpha: 1, duration: 0.5, stagger: 0.05, y: 0 }, revealAt)
            .to(parts[0].title, { duration: 0.55, yPercent: 0 }, revealAt + 0.05)
            .to(parts[0].price, { duration: 0.55, yPercent: 0 }, revealAt + 0.1)
            .to(parts[0].features, { autoAlpha: 1, duration: 0.4, stagger: 0.04, y: 0 }, revealAt + 0.12);
          if (period) tl.to(period, { autoAlpha: 1, duration: 0.4 }, revealAt + 0.1);

          // ---- plan states: the outer shell stays fixed, content changes --
          const base = 5.6;
          for (let step = 0; step < plans.length - 1; step += 1) {
            const at = base + step * (TRANSITION + HOLD);
            const current = parts[step];
            const next = parts[step + 1];
            const enterAt = at + 0.35;

            tl.to(current.eyebrow, { autoAlpha: 0, duration: 0.4, y: -26 }, at)
              .to(current.desc, { autoAlpha: 0, duration: 0.4, y: -22 }, at + 0.04)
              .to(current.title, { duration: 0.5, yPercent: -112 }, at + 0.08)
              .to(current.price, { duration: 0.5, yPercent: -116 }, at + 0.12)
              .to(current.features, { autoAlpha: 0, duration: 0.3, stagger: 0.035, y: -16 }, at + 0.05)
              .to(current.media, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, at + 0.1);

            tl.to(next.eyebrow, { autoAlpha: 1, duration: 0.45, y: 0 }, enterAt + 0.05)
              .to(next.desc, { autoAlpha: 1, duration: 0.45, y: 0 }, enterAt + 0.09)
              .to(next.title, { duration: 0.55, yPercent: 0 }, enterAt + 0.1)
              .to(next.price, { duration: 0.55, yPercent: 0 }, enterAt + 0.14)
              .to(next.features, { autoAlpha: 1, duration: 0.35, stagger: 0.04, y: 0 }, enterAt + 0.12)
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
        <p className="elc-pricing-heading">
          <span className="elc-sr-only">Okkkk that’s good... What’s the price?</span>
          <span aria-hidden="true" className="elc-pricing-line" data-price-line>
            <span className="elc-price-ok" data-price-ok>
              Okkkk that’s good
            </span>
            <span className="elc-price-dots">
              <span data-price-dot>.</span>
              <span data-price-dot>.</span>
              <span data-price-dot>.</span>
            </span>
            <span className="elc-price-question" data-price-question>
              What’s the price?
            </span>
            <span className="elc-price-slot" data-price-slot />
          </span>
        </p>

        <div className="elc-pricing-shell" data-price-shell>
          <div aria-hidden="true" className="elc-pricing-panel is-left" />
          <div aria-hidden="true" className="elc-pricing-panel is-head" />
          <div aria-hidden="true" className="elc-pricing-panel is-features" />

          {pricingPlans.map((plan) => (
            <div className="elc-pricing-plan" data-pricing-plan key={plan.title}>
              <p className="elc-pricing-eyebrow" data-el-eyebrow>
                {plan.eyebrow}
              </p>
              <div className="elc-pricing-media" data-el-media>
                <span className="elc-ph" />
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

          <span className="elc-pricing-period" data-price-period>
            / Month
          </span>
          <a className="elc-pill elc-pricing-cta" href="#contact">
            <RollingText>Book now</RollingText>
            <ArrowIcon className="elc-pill-icon" />
          </a>
        </div>
      </div>
    </section>
  );
}
