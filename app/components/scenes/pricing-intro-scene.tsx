"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function PricingIntroScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-price-intro-stage]");
      const line = root.querySelector<HTMLElement>("[data-price-line]");
      const ok = root.querySelector<HTMLElement>("[data-price-ok]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-price-dot]", root);
      const question = root.querySelector<HTMLElement>("[data-price-question]");
      const chip = root.querySelector<HTMLElement>("[data-price-chip]");
      if (!stage || !line || !ok || !question || !chip) return;

      // Center the currently visible prefix of the line, like the closing
      // scene's accumulating states.
      const prefixShift = (upTo: HTMLElement) => () =>
        (line.offsetWidth - (upTo.offsetLeft + upTo.offsetWidth)) / 2;

      gsap.set(ok, { autoAlpha: 0, yPercent: 65 });
      gsap.set(dots, { autoAlpha: 0, scale: 1.4, yPercent: 80 });
      gsap.set(question, { autoAlpha: 0, yPercent: 65 });
      gsap.set(chip, {
        autoAlpha: 0,
        clipPath: "inset(50% 50% 50% 50% round 23px)",
        rotation: -10,
        scale: 0.7,
        transformOrigin: "50% 60%",
      });

      // One connected sentence on a short scrubbed approach — the pricing
      // card is already peeking below while it completes.
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          end: "center 45%",
          invalidateOnRefresh: true,
          scrub: 0.85,
          start: "top 62%",
          trigger: stage,
        },
      });

      tl.to(ok, { autoAlpha: 1, duration: 0.4, yPercent: 0 }, 0);

      dots.forEach((dot, index) => {
        tl.to(
          dot,
          { autoAlpha: 1, duration: 0.18, ease: "power3.out", scale: 1, yPercent: 0 },
          0.35 + index * 0.1,
        );
      });

      // fromTo keeps the font-dependent centering fresh across refreshes.
      tl.addLabel("question", 0.75)
        .fromTo(
          line,
          { x: prefixShift(ok) },
          { duration: 0.5, ease: "power1.inOut", x: 0 },
          "question",
        )
        .to(question, { autoAlpha: 1, duration: 0.45, yPercent: 0 }, "question+=0.1")
        .to(
          chip,
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0% round 23px)",
            duration: 0.4,
            ease: "power3.out",
            scale: 1,
          },
          "question+=0.25",
        )
        .to(chip, { duration: 0.35, ease: "power2.inOut", rotation: 0 }, "question+=0.4");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-price-intro" ref={rootRef}>
      <div className="elc-price-intro-stage" data-price-intro-stage>
        <h2 className="elc-price-intro-heading">
          <span className="elc-sr-only">Okkkk that’s good... What’s the price?</span>
          <span aria-hidden="true" className="elc-price-intro-line" data-price-line>
            <span className="elc-price-intro-ok" data-price-ok>
              Okkkk that’s good
            </span>
            <span className="elc-price-intro-dots">
              <span data-price-dot>.</span>
              <span data-price-dot>.</span>
              <span data-price-dot>.</span>
            </span>
            <span className="elc-price-question" data-price-question>
              What’s the price?
            </span>{" "}
            <span className="elc-chip" data-price-chip />
          </span>
        </h2>
      </div>
    </section>
  );
}
