"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import type { ShowcaseItem } from "./data";

type ShowcaseVariant = "websites" | "social";

type ShowcaseSceneProps = {
  title: string;
  items: ShowcaseItem[];
  variant: ShowcaseVariant;
};

// Rhythm settings keep the two showcases related but not mechanically
// identical: Social drifts sideways and holds each frame slightly longer.
const RHYTHM: Record<
  ShowcaseVariant,
  { pinEnd: string; pinEndMobile: string; segment: number; drift: number; exitTilt: number }
> = {
  websites: { pinEnd: "+=300%", pinEndMobile: "+=220%", segment: 1.25, drift: 0, exitTilt: -1.4 },
  social: { pinEnd: "+=360%", pinEndMobile: "+=260%", segment: 1.45, drift: 4.5, exitTilt: 1.8 },
};

export default function ShowcaseScene({ title, items, variant }: ShowcaseSceneProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const hasTakeover = variant === "social";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-showcase-stage]");
      const frames = gsap.utils.toArray<HTMLElement>("[data-showcase-frame]", root);
      const labels = gsap.utils.toArray<HTMLElement>("[data-showcase-label]", root);
      const takeover = root.querySelector<HTMLElement>("[data-takeover]");
      if (!stage || frames.length === 0) return;

      const rhythm = RHYTHM[variant];
      const driftDirection = (index: number) => (index % 2 === 0 ? 1 : -1);

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          // Travel in viewport-based pixels so frames fully clear the stage
          // on every screen size (own-height percentages fall short on mobile).
          const clearance = (frame: HTMLElement) =>
            (window.innerHeight + frame.offsetHeight) / 2 + 60;

          // Frame 1 is already in place — it continues the previous scene's
          // expanded media, so the hand-off reads as one continuous shot.
          frames.forEach((frame, index) => {
            gsap.set(frame, {
              rotation: 0,
              scale: index === 0 ? 1 : 0.94,
              xPercent: index === 0 ? 0 : rhythm.drift * driftDirection(index),
              y: index === 0 ? 0 : () => clearance(frame),
            });
          });
          labels.forEach((label, index) => {
            gsap.set(label, { autoAlpha: index === 0 ? 1 : 0, yPercent: index === 0 ? 0 : 90 });
          });
          if (takeover) {
            gsap.set(takeover, { yPercent: 101 });
          }

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? rhythm.pinEndMobile : rhythm.pinEnd,
              invalidateOnRefresh: true,
              pin: true,
              scrub: 0.85,
              start: "top top",
              trigger: stage,
            },
          });

          tl.to({}, { duration: 0.35 });

          for (let index = 0; index < frames.length - 1; index += 1) {
            const at = 0.35 + index * (rhythm.segment + 0.3);

            tl.to(
              frames[index],
              {
                duration: rhythm.segment,
                rotation: rhythm.exitTilt * driftDirection(index),
                scale: 0.95,
                xPercent: -rhythm.drift * driftDirection(index),
                y: () => -clearance(frames[index]),
              },
              at,
            )
              .to(
                frames[index + 1],
                {
                  duration: rhythm.segment,
                  rotation: 0,
                  scale: 1,
                  xPercent: 0,
                  y: 0,
                },
                at + 0.16,
              )
              .to(
                labels[index],
                { autoAlpha: 0, duration: rhythm.segment * 0.45, yPercent: -90 },
                at + 0.05,
              )
              .to(
                labels[index + 1],
                { autoAlpha: 1, duration: rhythm.segment * 0.5, yPercent: 0 },
                at + rhythm.segment * 0.4,
              );
          }

          const settled = 0.35 + (frames.length - 1) * (rhythm.segment + 0.3) + rhythm.segment;

          if (takeover) {
            // Black panel rises from the bottom and covers the whole stage
            // before the pin releases into the dark scene that follows.
            tl.to(
              takeover,
              { duration: 1.1, ease: "power2.inOut", yPercent: 0 },
              settled + 0.25,
            );
          }

          tl.to({}, { duration: 0.25 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, [variant]);

  return (
    <section className={`elc-showcase is-${variant}`} ref={rootRef}>
      <div className="elc-showcase-stage" data-showcase-stage>
        <h2 className="elc-showcase-title">{title}</h2>
        <div aria-hidden="true" className="elc-showcase-frames">
          {items.map((item) => (
            <figure className="elc-showcase-frame" data-showcase-frame key={item.label}>
              <Image alt="" fill sizes="(max-width: 767px) 92vw, 50vw" src={item.src} />
            </figure>
          ))}
        </div>
        <div className="elc-showcase-labels">
          {items.map((item) => (
            <span className="elc-showcase-label" data-showcase-label key={item.label}>
              {item.label}
              <span className="elc-sr-only">: {item.alt}</span>
            </span>
          ))}
        </div>
        {hasTakeover ? <div className="elc-takeover elc-takeover-dark" data-takeover /> : null}
      </div>
    </section>
  );
}
