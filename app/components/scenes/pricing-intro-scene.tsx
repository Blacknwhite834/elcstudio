"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import SplitWords from "../split-words";

export default function PricingIntroScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-price-intro-stage]");
      const group = root.querySelector<HTMLElement>("[data-price-intro-group]");
      const okWords = gsap.utils.toArray<HTMLElement>("[data-price-ok] [data-split-word]", root);
      const question = root.querySelector<HTMLElement>("[data-price-question]");
      const chip = root.querySelector<HTMLElement>("[data-price-chip]");
      if (!stage || !group || !question || !chip) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          gsap.set(group, { y: "0.65em" });
          gsap.set(okWords, { autoAlpha: 0, yPercent: 80 });
          gsap.set(question, { autoAlpha: 0, yPercent: 70 });
          gsap.set(chip, {
            autoAlpha: 0,
            clipPath: "inset(50% 50% 50% 50% round 23px)",
            rotation: -10,
            scale: 0.7,
            transformOrigin: "50% 60%",
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=120%" : "+=150%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.85,
              start: "top top",
              trigger: stage,
            },
          });

          okWords.forEach((word, index) => {
            tl.to(word, { autoAlpha: 1, duration: 0.35, yPercent: 0 }, index * 0.09);
          });

          // The question slides in below while the pair recenters optically.
          tl.addLabel("question", 0.75)
            .to(group, { duration: 0.6, ease: "power1.inOut", y: 0 }, "question")
            .to(question, { autoAlpha: 1, duration: 0.5, yPercent: 0 }, "question+=0.1");

          // Figma chip (node 107:194): masked scale-in, settles with a small
          // rotation, then compresses subtly while the scene stays active.
          tl.addLabel("chip", 1.35)
            .to(
              chip,
              {
                autoAlpha: 1,
                clipPath: "inset(0% 0% 0% 0% round 23px)",
                duration: 0.45,
                ease: "power3.out",
                scale: 1,
              },
              "chip",
            )
            .to(chip, { duration: 0.4, ease: "power2.inOut", rotation: 0 }, "chip+=0.15")
            .to(chip, { duration: 0.35, ease: "power1.inOut", scaleY: 0.92 }, "chip+=0.6")
            .to(chip, { duration: 0.35, ease: "power1.inOut", scaleY: 1 }, "chip+=0.95");

          tl.to({}, { duration: 0.25 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-price-intro" ref={rootRef}>
      <div className="elc-price-intro-stage" data-price-intro-stage>
        <div className="elc-price-intro-group" data-price-intro-group>
          <p className="elc-price-intro-ok" data-price-ok>
            <SplitWords text="Okkkk that’s good" />
          </p>
          <h2 className="elc-price-intro-question">
            <span className="elc-price-question" data-price-question>
              What’s the price?
            </span>{" "}
            <span aria-hidden="true" className="elc-chip" data-price-chip />
          </h2>
        </div>
      </div>
    </section>
  );
}
