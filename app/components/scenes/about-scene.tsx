"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import { aboutSentence, aboutTokens } from "./data";

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
        <Image alt="" fill sizes="120px" src={token.src} />
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

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=110%" : "+=150%",
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

            // Each inline image gets its own treatment, timed to the words
            // around it (Figma 71:17 / 71:19 / 71:21).
            const image = element.querySelector("img");
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

          tl.to({}, { duration: 0.5 });
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
          </span>
        </p>
      </div>
    </section>
  );
}
