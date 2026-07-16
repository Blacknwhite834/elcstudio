"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { processSteps } from "./data";

// Figma: "work?" inflates from the 52px sentence to the 128px mid-state
// (node 77:84) before the transform-based full-bleed expansion (node 74:83).
const WORK_INFLATE = 128 / 52;
const WORK_FILL_RATIO = 0.985;

// Vertical stagger of the process cards, as fractions of the viewport height
// (extends the Figma three-card composition's alternating baselines).
const CARD_OFFSETS = [-0.045, 0.13, -0.1, 0.07, -0.06, 0.11];
const CARD_OFFSETS_MOBILE = [-0.015, 0.035, -0.026, 0.02, -0.018, 0.03];

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
      const track = root.querySelector<HTMLElement>("[data-process-track]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-process-card]", root);
      const lightPanel = root.querySelector<HTMLElement>("[data-light-panel]");

      if (!stage || !line || !but || !work || !track || !lightPanel) return;
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
          const offsets = isMobile ? CARD_OFFSETS_MOBILE : CARD_OFFSETS;
          const cardOffset = (index: number) =>
            offsets[index % offsets.length] * window.innerHeight;

          // Cards keep their staggered baselines; the whole track starts
          // beyond the right edge and rides in as "work" finishes scaling.
          const placeCards = () => {
            cards.forEach((card, index) => {
              gsap.set(card, { y: cardOffset(index) });
            });
          };

          placeCards();
          gsap.set(lightPanel, { y: 0, yPercent: 101 });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=480%" : "+=640%",
              invalidateOnRefresh: true,
              onRefreshInit: placeCards,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // "But..." appears immediately — the panel has just covered the
          // stage, so no dead black scroll passes before the text reads.
          tl.to(but, { autoAlpha: 1, duration: 0.3, yPercent: 0 }, 0);
          butDots.forEach((dot, index) => {
            tl.to(
              dot,
              { autoAlpha: 1, duration: 0.18, ease: "power3.out", scale: 1, yPercent: 0 },
              0.18 + index * 0.1,
            );
          });

          // "how do we work?" joins while the line slides to true center.
          // fromTo keeps the font-dependent offset fresh across refreshes.
          tl.addLabel("how", 0.7);
          tl.fromTo(
            line,
            { x: centerButX },
            { duration: 0.6, ease: "power1.inOut", x: 0 },
            "how",
          );
          leadWords.forEach((wordEl, index) => {
            tl.to(
              wordEl,
              { autoAlpha: 1, duration: 0.35, yPercent: 0 },
              0.75 + index * 0.1,
            );
          });
          tl.to(work, { autoAlpha: 1, duration: 0.4, yPercent: 0 }, 1.1);

          // Mid-state: "work?" inflates to the 128px scale inside the line;
          // the flex-centered line reflows and recenters as it grows.
          tl.to(
            work,
            { duration: 0.6, ease: "power2.inOut", fontSize: `${WORK_INFLATE}em` },
            1.7,
          );

          // Full-bleed: scale the line about the center of "work?" so the
          // word swallows the viewport; measured when the playhead arrives.
          tl.addLabel("giant", 2.6)
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

          // The horizontal journey begins while "work" is still scaling: the
          // track rides in from beyond the right edge and keeps traveling
          // left in one continuous scroll-mapped movement.
          const horizontalStart = 3.1;
          const horizontalDuration = 3.6;
          tl.addLabel("horizontal", horizontalStart).fromTo(
            track,
            { x: () => window.innerWidth },
            {
              duration: horizontalDuration,
              ease: "none",
              immediateRender: true,
              x: () => -travel(),
            },
            "horizontal",
          );

          // Light panel takeover into the pricing chapter. The pricing
          // section is pulled up 100svh (CSS margin) and reaches the viewport
          // top at the pin's enter fraction; the panel finishes covering
          // exactly then, so the light-on-light hand-off is seamless.
          const enterFraction = isMobile ? 1 - 1 / 4.8 : 1 - 1 / 6.4;
          const panelStart = horizontalStart + horizontalDuration + 0.2;
          const panelDur = 1.1;
          const panelEnd = panelStart + panelDur;
          const total = panelEnd / enterFraction;
          tl.addLabel("panel", panelStart)
            .to(lightPanel, { duration: panelDur, ease: "power2.inOut", yPercent: 0 }, "panel")
            .to({}, { duration: total - panelEnd }, panelEnd);

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
                  <span className="elc-ph" />
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
