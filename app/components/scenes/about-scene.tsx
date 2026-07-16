"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { aboutClosing, aboutSentence, aboutTokens } from "./data";

const WORD_STAGGER = 0.05;

function renderToken(token: (typeof aboutTokens)[number], index: number) {
  if (token.type === "brand") {
    return (
      <span className="elc-about-word" data-about-word key={`brand-${index}`}>
        elc.studio<span className="elc-accent">©</span>
      </span>
    );
  }

  if (token.type === "media") {
    return (
      <span className="elc-about-media" data-about-media key={`media-${index}`}>
        <span className="elc-ph" />
      </span>
    );
  }

  return token.value.split(" ").map((word, wordIndex) => (
    <Fragment key={`word-${index}-${wordIndex}`}>
      {wordIndex > 0 ? " " : null}
      <span className="elc-about-word" data-about-word>
        {word}
      </span>
    </Fragment>
  ));
}

export default function AboutScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-about-stage]");
      if (!stage) return;

      // Words and media in sentence order, so each image reveals exactly
      // alongside the words that surround it.
      const flow = gsap.utils.toArray<HTMLElement>(
        "[data-about-word], [data-about-media]",
        root,
      );
      const questionWords = root.querySelector<HTMLElement>("[data-about-question-words]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-about-dot]", root);

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          // Resting states for the closing beat, set from JS so the no-JS /
          // reduced-motion fallback keeps the phrase fully legible.
          if (questionWords) {
            const font = parseFloat(getComputedStyle(questionWords).fontSize) || 0;
            gsap.set(questionWords, { autoAlpha: 0, y: font * 0.6 });
          }
          if (dots.length) {
            gsap.set(dots, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 60%" });
          }

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=160%" : "+=220%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.85,
              start: "top top",
              trigger: stage,
            },
          });

          let mediaIndex = 0;
          let wordCount = 0;

          flow.forEach((element) => {
            const at = wordCount * WORD_STAGGER;

            if (element.dataset.aboutWord !== undefined) {
              gsap.set(element, { autoAlpha: 0.22, color: "#a7a7a7", y: 14 });
              tl.to(element, { autoAlpha: 1, color: "#050505", duration: 0.5, y: 0 }, at);
              wordCount += 1;
              return;
            }

            // Each inline placeholder gets its own treatment, timed to the
            // words around it (Figma 71:17 / 71:19 / 71:21).
            const image = element.querySelector<HTMLElement>(".elc-ph");
            if (mediaIndex === 0) {
              gsap.set(element, {
                autoAlpha: 0,
                clipPath: "inset(0% 100% 0% 0% round 25px)",
              });
              tl.to(
                element,
                {
                  autoAlpha: 1,
                  clipPath: "inset(0% 0% 0% 0% round 25px)",
                  duration: 0.55,
                  ease: "power3.out",
                },
                at,
              );
            } else if (mediaIndex === 1) {
              gsap.set(element, {
                autoAlpha: 0,
                rotation: -6,
                scale: 0.85,
                transformOrigin: "50% 60%",
              });
              tl.to(
                element,
                { autoAlpha: 1, duration: 0.6, ease: "power3.out", rotation: 0, scale: 1 },
                at,
              );
            } else {
              gsap.set(element, { autoAlpha: 0 });
              if (image) gsap.set(image, { yPercent: 110 });
              tl.to(element, { autoAlpha: 1, duration: 0.2 }, at).to(
                image,
                { duration: 0.55, ease: "power3.out", yPercent: 0 },
                at + 0.05,
              );
            }
            mediaIndex += 1;
          });

          // ---- closing beat: "The question is..." -------------------------
          // Glued to the end of the paragraph, but with its own distinct
          // reveal (accent clip-mask rise + staggered dots) — not the
          // paragraph's word-by-word animation.
          if (questionWords) {
            const paraEnd = tl.duration();

            // Hold the finished paragraph, then reveal the phrase rising
            // ~0.6em into its clip mask. Calm, no overshoot.
            tl.to(
              questionWords,
              { autoAlpha: 1, duration: 0.7, ease: "power2.out", y: 0 },
              paraEnd + 0.35,
            );

            // The three dots then arrive one by one — a small beat of
            // anticipation, never together.
            const dotsAt = paraEnd + 0.35 + 0.7;
            dots.forEach((dot, index) => {
              tl.to(
                dot,
                { autoAlpha: 1, duration: 0.3, ease: "power2.out", scale: 1 },
                dotsAt + index * 0.14,
              );
            });

            // Hold the complete phrase long enough to read before unpinning.
            tl.to({}, { duration: 0.6 });
          } else {
            tl.to({}, { duration: 0.5 });
          }
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="about-title" className="elc-about" id="about" ref={rootRef}>
      <div className="elc-about-stage" data-about-stage>
        <h2 className="elc-sr-only" id="about-title">
          About elc.studio
        </h2>
        <p className="elc-about-text">
          <span className="elc-sr-only">{aboutSentence}</span>
          <span aria-hidden="true" className="elc-about-visual">
            {aboutTokens.map((token, index) => (
              <span className="elc-about-chunk" key={index}>
                {index > 0 ? " " : null}
                {renderToken(token, index)}
              </span>
            ))}
          </span>{" "}
          <span aria-hidden="true" className="elc-about-question" data-about-question>
            <span className="elc-about-question-reveal">
              <span className="elc-about-question-words" data-about-question-words>
                {aboutClosing.lead}
              </span>
              <span className="elc-about-question-dots" data-about-question-dots>
                {Array.from({ length: aboutClosing.dots }).map((_, dotIndex) => (
                  <span className="elc-about-dot" data-about-dot key={dotIndex}>
                    .
                  </span>
                ))}
              </span>
            </span>
          </span>
        </p>
      </div>
    </section>
  );
}
