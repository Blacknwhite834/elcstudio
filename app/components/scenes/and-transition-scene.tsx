"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import { andTransitionMedia } from "./data";

const SMALL_MEDIA_RATIO = 80 / 142;
const GROWN_MEDIA_RATIO = 533 / 946;

export default function AndTransitionScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-and-stage]");
      const word = root.querySelector<HTMLElement>("[data-and-word]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-and-dot]", root);
      const dotsWrap = root.querySelector<HTMLElement>("[data-and-dots]");
      const media = root.querySelector<HTMLElement>("[data-and-media]");
      if (!stage || !word || !media || !dotsWrap) return;

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

          gsap.set(word, { autoAlpha: 0, yPercent: 60 });
          gsap.set(dots, { autoAlpha: 0, scale: 1.5, yPercent: 90 });
          gsap.set(dotsWrap, { letterSpacing: "0em" });
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
              end: isMobile ? "+=170%" : "+=230%",
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // Quicker dot beat than the "What we do" intro — related, not cloned.
          tl.to(word, { autoAlpha: 1, duration: 0.4, yPercent: 0 }, 0);
          dots.forEach((dot, index) => {
            tl.to(
              dot,
              { autoAlpha: 1, duration: 0.22, ease: "power3.out", scale: 1, yPercent: 0 },
              0.3 + index * 0.14,
            );
          });
          tl.to(dotsWrap, { duration: 0.4, ease: "power2.inOut", letterSpacing: "0.05em" }, 0.42);

          tl.addLabel("pop", 0.95)
            .to(
              media,
              {
                autoAlpha: 1,
                duration: 0.4,
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
                duration: 0.36,
                ease: "power3.out",
                scale: 1,
              },
              "pop+=0.05",
            );

          // Slower growth than scene 2 — the media carries the narrative into
          // the Social Presence showcase that starts with the same frame.
          tl.addLabel("grow", 1.5)
            .to(
              media,
              {
                duration: 1.55,
                ease: "power2.inOut",
                height: () => grownWidth() * GROWN_MEDIA_RATIO,
                width: grownWidth,
              },
              "grow",
            )
            .to({}, { duration: 0.25 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-and" ref={rootRef}>
      <div className="elc-and-stage" data-and-stage>
        <h2 className="elc-and-line">
          <span className="elc-sr-only">And...</span>
          <span aria-hidden="true" className="elc-and-row">
            <span className="elc-and-word" data-and-word>
              And
              <span className="elc-and-dots" data-and-dots>
                <span data-and-dot>.</span>
                <span data-and-dot>.</span>
                <span data-and-dot>.</span>
              </span>
            </span>
            <span className="elc-and-media" data-and-media>
              <Image
                alt=""
                height={533}
                sizes="(max-width: 767px) 100vw, 50vw"
                src={andTransitionMedia.src}
                style={{ height: "100%", objectFit: "cover", width: "100%" }}
                width={946}
              />
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
