"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { processSteps } from "./data";

// Figma: "work?" inflates from the 52px sentence to the 128px mid-state
// (node 77:84) before the transform-based full-bleed expansion (node 74:83).
const WORK_INFLATE = 128 / 52;
const WORK_FILL_RATIO = 0.985;

// Vertical stagger of the three process cards, as fractions of the viewport
// height (from the Figma composition: cards sit at offset baselines).
const CARD_OFFSETS = [-0.045, 0.13, -0.1];
const CARD_OFFSETS_MOBILE = [-0.015, 0.035, -0.026];

export type ProcessProgressDetail = {
  active: boolean;
  progress: number;
};

export default function DarkScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-dark-stage]");
      const line = root.querySelector<HTMLElement>("[data-dark-line]");
      const but = root.querySelector<HTMLElement>("[data-dark-but]");
      const butDots = gsap.utils.toArray<HTMLElement>("[data-but-dot]", root);
      const leadWords = gsap.utils.toArray<HTMLElement>("[data-lead-word]", root);
      const work = root.querySelector<HTMLElement>("[data-dark-work]");
      const measureLine = root.querySelector<HTMLElement>("[data-measure-line]");
      const measureBut = root.querySelector<HTMLElement>("[data-measure-but]");
      const process = root.querySelector<HTMLElement>("[data-process]");
      const processTitle = root.querySelector<HTMLElement>("[data-process-title]");
      const track = root.querySelector<HTMLElement>("[data-process-track]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-process-card]", root);
      const lightPanel = root.querySelector<HTMLElement>("[data-light-panel]");

      if (!stage || !line || !but || !work || !process || !track || !lightPanel) return;
      if (!measureLine || !measureBut) return;

      // The hidden measure clone is never animated, so prefix-centering
      // offsets stay correct on any refresh regardless of scrub position.
      const centerButX = () => (measureLine.offsetWidth - measureBut.offsetWidth) / 2;
      const travel = () =>
        Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.08);

      let lastActive = false;
      let lastIndex = -1;
      const dispatchProcess = (active: boolean, progress: number) => {
        const index = Math.round(progress * (processSteps.length - 1));
        if (active === lastActive && index === lastIndex) return;
        lastActive = active;
        lastIndex = index;
        window.dispatchEvent(
          new CustomEvent<ProcessProgressDetail>("elc:process", {
            detail: { active, progress },
          }),
        );
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          gsap.set(but, { autoAlpha: 0, yPercent: 60 });
          gsap.set(butDots, { autoAlpha: 0, scale: 1.4, yPercent: 80 });
          gsap.set(leadWords, { autoAlpha: 0, yPercent: 70 });
          gsap.set(work, { autoAlpha: 0, yPercent: 70 });
          const cardOffset = (index: number) =>
            (isMobile ? CARD_OFFSETS_MOBILE : CARD_OFFSETS)[index % 3] * window.innerHeight;

          gsap.set(process, { autoAlpha: 0 });
          gsap.set(processTitle, { autoAlpha: 0, y: 54 });
          cards.forEach((card, index) => {
            gsap.set(card, { autoAlpha: 0, y: () => cardOffset(index) + 72 });
          });
          gsap.set(track, { x: 0 });
          gsap.set(lightPanel, { yPercent: 101 });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=430%" : "+=580%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // "But..." appears alone, optically centered via the prefix shift.
          tl.to(but, { autoAlpha: 1, duration: 0.35, yPercent: 0 }, 0);
          butDots.forEach((dot, index) => {
            tl.to(
              dot,
              { autoAlpha: 1, duration: 0.2, ease: "power3.out", scale: 1, yPercent: 0 },
              0.24 + index * 0.11,
            );
          });

          // "how do we work?" joins while the line slides to true center.
          // fromTo keeps the font-dependent offset fresh across refreshes.
          tl.addLabel("how", 1.0);
          tl.fromTo(
            line,
            { x: centerButX },
            { duration: 0.7, ease: "power1.inOut", x: 0 },
            "how",
          );
          leadWords.forEach((wordEl, index) => {
            tl.to(
              wordEl,
              { autoAlpha: 1, duration: 0.4, yPercent: 0 },
              1.05 + index * 0.12,
            );
          });
          tl.to(work, { autoAlpha: 1, duration: 0.45, yPercent: 0 }, 1.45);

          // Mid-state: "work?" inflates to the 128px scale inside the line;
          // the flex-centered line reflows and recenters as it grows.
          tl.to(
            work,
            { duration: 0.7, ease: "power2.inOut", fontSize: `${WORK_INFLATE}em` },
            2.15,
          );

          // Full-bleed: scale the line about the center of "work?" so the
          // word swallows the viewport; measured when the playhead arrives.
          tl.addLabel("giant", 3.1)
            .set(
              line,
              {
                transformOrigin: () => {
                  const lineRect = line.getBoundingClientRect();
                  const workRect = work.getBoundingClientRect();
                  return `${workRect.left - lineRect.left + workRect.width / 2}px 50%`;
                },
              },
              "giant",
            )
            .to(but, { autoAlpha: 0, duration: 0.35 }, "giant")
            .to(leadWords, { autoAlpha: 0, duration: 0.35 }, "giant")
            .to(
              line,
              {
                duration: 1.25,
                ease: "power2.inOut",
                scale: () => {
                  const workWidth = work.getBoundingClientRect().width;
                  return workWidth > 0
                    ? (window.innerWidth * WORK_FILL_RATIO) / workWidth
                    : 1;
                },
                x: () => {
                  const workRect = work.getBoundingClientRect();
                  return (
                    gsap.getProperty(line, "x") as number
                    + window.innerWidth / 2
                    - (workRect.left + workRect.width / 2)
                  );
                },
              },
              "giant+=0.05",
            )
            .to(work, { autoAlpha: 0.34, duration: 0.5, ease: "power1.inOut" }, "giant+=0.85");

          // The process strip settles over the typographic backdrop.
          tl.addLabel("process", 4.15)
            .to(process, { autoAlpha: 1, duration: 0.3 }, "process")
            .to(processTitle, { autoAlpha: 1, duration: 0.5, y: 0 }, "process+=0.05");
          cards.forEach((card, index) => {
            tl.to(
              card,
              { autoAlpha: 1, duration: 0.5, y: () => cardOffset(index) },
              4.3 + index * 0.12,
            );
          });

          const horizontalStart = 5.0;
          const horizontalDuration = 1.9;
          tl.addLabel("horizontal", horizontalStart).to(
            track,
            { duration: horizontalDuration, ease: "none", x: () => -travel() },
            "horizontal",
          );

          // Light panel takeover into the pricing chapter.
          tl.addLabel("panel", horizontalStart + horizontalDuration + 0.25)
            .to(lightPanel, { duration: 1.1, ease: "power2.inOut", yPercent: 0 }, "panel")
            .to({}, { duration: 0.2 });

          tl.eventCallback("onUpdate", () => {
            const time = tl.time();
            const local = gsap.utils.clamp(
              0,
              1,
              (time - horizontalStart) / horizontalDuration,
            );
            const active =
              time >= horizontalStart - 0.35 &&
              time <= horizontalStart + horizontalDuration + 0.45;
            dispatchProcess(active, local);
          });

          return () => {
            dispatchProcess(false, 0);
          };
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-dark" id="method" ref={rootRef}>
      <div className="elc-dark-stage" data-dark-stage>
        <h2 className="elc-dark-heading">
          <span className="elc-sr-only">But... how do we work?</span>
          <span aria-hidden="true" className="elc-dark-line" data-dark-line>
            <span className="elc-dark-but" data-dark-but>
              But
              <span data-but-dot>.</span>
              <span data-but-dot>.</span>
              <span data-but-dot>.</span>
            </span>{" "}
            <span data-lead-word>how</span> <span data-lead-word>do</span>{" "}
            <span data-lead-word>we</span>{" "}
            <span className="elc-dark-work" data-dark-work>
              <span className="elc-accent">work</span>?
            </span>
          </span>
          {/* Static clone used only for measurements — never animated. */}
          <span aria-hidden="true" className="elc-dark-line is-measure" data-measure-line>
            <span data-measure-but>But...</span> how do we <span>work?</span>
          </span>
        </h2>

        <div className="elc-process" data-process>
          <div className="elc-process-track" data-process-track>
            <p className="elc-process-title" data-process-title>
              This is our process:
            </p>
            {processSteps.map((step) => (
              <article className="elc-process-card" data-process-card key={step.title}>
                <div className="elc-process-media">
                  <video
                    data-motion-video
                    loop
                    muted
                    playsInline
                    poster={step.posterSrc}
                    preload="none"
                  >
                    <source src={step.videoMp4Src} type="video/mp4" />
                    <source src={step.videoWebmSrc} type="video/webm" />
                  </video>
                </div>
                <div className="elc-process-label">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="elc-takeover elc-takeover-light" data-light-panel />
      </div>
    </section>
  );
}
