"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import { whatWeDoMedia } from "./data";

// Per-word entry choreography — deterministic offsets, no random values.
const WORD_RISE = [120, 92, 138];
const WORD_TILT = [-3, 2.4, -2.2];

const SMALL_MEDIA_RATIO = 80 / 142;
const GROWN_MEDIA_RATIO = 533 / 946;

export default function WhatWeDoScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-wwd-stage]");
      const words = gsap.utils.toArray<HTMLElement>("[data-wwd-word]");
      const media = root.querySelector<HTMLElement>("[data-wwd-media]");
      if (!stage || !media || words.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          const smallWidth = () =>
            Math.max(isMobile ? 64 : 96, window.innerWidth * (142 / 1920) * (isMobile ? 2.2 : 1));
          const grownWidth = () =>
            isMobile
              ? window.innerWidth - 32
              : Math.min(window.innerWidth * (946 / 1920), window.innerWidth - 48);

          words.forEach((word, index) => {
            gsap.set(word, {
              autoAlpha: 0,
              rotation: WORD_TILT[index % WORD_TILT.length],
              yPercent: WORD_RISE[index % WORD_RISE.length],
            });
          });
          gsap.set(media, {
            autoAlpha: 0,
            clipPath: "inset(38% 42% 38% 42% round 25px)",
            height: 0,
            scale: 0.72,
            width: 0,
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=190%" : "+=260%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          tl.addLabel("words", 0);
          words.forEach((word, index) => {
            tl.to(
              word,
              { autoAlpha: 1, duration: 0.55, rotation: 0, yPercent: 0 },
              index * 0.16,
            );
          });

          // The media pops into the gap between "we" and "do" like a word.
          tl.addLabel("pop", 0.85)
            .to(
              media,
              {
                autoAlpha: 1,
                duration: 0.42,
                ease: "power3.out",
                height: () => smallWidth() * SMALL_MEDIA_RATIO,
                width: smallWidth,
              },
              "pop",
            )
            .to(
              media,
              {
                clipPath: "inset(0% 0% 0% 0% round 25px)",
                duration: 0.4,
                ease: "power3.out",
                scale: 1,
              },
              "pop+=0.06",
            );

          // Continued scroll expands the media into the next scene's frame;
          // the flex line pushes "What we" / "do" outward as it grows.
          tl.addLabel("grow", 1.55)
            .to(
              media,
              {
                duration: 1.3,
                ease: "power2.inOut",
                height: () => grownWidth() * GROWN_MEDIA_RATIO,
                width: grownWidth,
              },
              "grow",
            )
            .to({}, { duration: 0.3 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-wwd" ref={rootRef}>
      <div className="elc-wwd-stage" data-wwd-stage>
        <h2 className="elc-wwd-line">
          <span className="elc-sr-only">What we do</span>
          <span aria-hidden="true" className="elc-wwd-row">
            <span className="elc-wwd-word" data-wwd-word>
              What
            </span>{" "}
            <span className="elc-wwd-word" data-wwd-word>
              we
            </span>
            <span className="elc-wwd-media" data-wwd-media>
              <Image
                alt=""
                height={533}
                sizes="(max-width: 767px) 100vw, 50vw"
                src={whatWeDoMedia.src}
                style={{ height: "100%", objectFit: "cover", width: "100%" }}
                width={946}
              />
            </span>
            <span className="elc-wwd-word" data-wwd-word>
              do
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
