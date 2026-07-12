"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import type { ShowcaseItem } from "./data";

type JourneyVariant = "websites" | "social";

type JourneySceneProps = {
  variant: JourneyVariant;
  items: ShowcaseItem[];
};

// Per-word entry choreography — deterministic offsets, no random values.
const WORD_RISE = [120, 92, 138];
const WORD_TILT = [-3, 2.4, -2.2];

const MEDIA_RATIO = 533 / 946;
const SMALL_RATIO = 80 / 142;
// Figma rail frame widths relative to the 1920 canvas (nodes 74:29/74:33,
// 74:64/74:65): the follow-up examples are slightly narrower than Example 1.
const RAIL_WIDTHS: Record<JourneyVariant, [number, number]> = {
  websites: [0.43, 0.44],
  social: [0.43, 0.43],
};

const TITLES: Record<JourneyVariant, string> = {
  websites: "Websites:",
  social: "Social Presence:",
};

export default function JourneyScene({ variant, items }: JourneySceneProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const isSocial = variant === "social";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-journey-stage]");
      const row = root.querySelector<HTMLElement>("[data-journey-row]");
      const words = gsap.utils.toArray<HTMLElement>("[data-journey-word]", root);
      const dots = gsap.utils.toArray<HTMLElement>("[data-journey-dot]", root);
      const introLeft = root.querySelector<HTMLElement>("[data-intro-left]");
      const introRight = root.querySelector<HTMLElement>("[data-intro-right]");
      const title = root.querySelector<HTMLElement>("[data-journey-title]");
      const label = root.querySelector<HTMLElement>("[data-journey-label]");
      const media = root.querySelector<HTMLElement>("[data-journey-media]");
      const rail = root.querySelector<HTMLElement>("[data-journey-rail]");
      const railItems = gsap.utils.toArray<HTMLElement>("[data-rail-item]", root);
      const measureLeft = root.querySelector<HTMLElement>("[data-measure-left]");
      const measureRight = root.querySelector<HTMLElement>("[data-measure-right]");
      const takeover = root.querySelector<HTMLElement>("[data-takeover]");

      if (!stage || !row || !introLeft || !title || !label || !media || !rail) return;
      if (!measureLeft) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };
          const vw = () => window.innerWidth;

          const smallWidth = () =>
            Math.max(isMobile ? 64 : 96, vw() * (142 / 1920) * (isMobile ? 2.2 : 1));
          const grownWidth = () =>
            isMobile ? vw() - 32 : Math.min(vw() * (946 / 1920), vw() - 48);
          const grownHeight = () => grownWidth() * MEDIA_RATIO;
          const railWidth = (index: number) =>
            isMobile ? vw() * 0.82 : vw() * RAIL_WIDTHS[variant][index];
          const railHeight = (index: number) => railWidth(index) * MEDIA_RATIO;
          const railGap = () => gsap.utils.clamp(40, 120, vw() * 0.0625);

          const rowGap = () => parseFloat(getComputedStyle(row).columnGap) || 0;
          const introLeftWidth = () => measureLeft.offsetWidth;
          const introRightWidth = () => measureRight?.offsetWidth ?? 0;
          // The grown flex row: [intro-left][gap][media][gap][intro-right],
          // centered — every final position derives from these widths.
          const rowLeftEdge = () =>
            (window.innerWidth -
              (introLeftWidth() + introRightWidth() + grownWidth() + 2 * rowGap())) /
            2;

          // Distance from the media center to each next rail item center —
          // media, label and rail all travel by the same physical deltas.
          const stepOne = () => grownHeight() / 2 + railGap() + railHeight(0) / 2;
          const stepTwo = () => railHeight(0) / 2 + railGap() + railHeight(1) / 2;

          // The grown flex row centers the media at stageCenter + (L−R)/2,
          // measured on the never-animated clones so fonts can load late.
          const mediaCenterOffset = () => (introLeftWidth() - introRightWidth()) / 2;

          const place = () => {
            railItems.forEach((item, index) => {
              gsap.set(item, {
                width: railWidth(index),
                x: isMobile ? 0 : mediaCenterOffset(),
                xPercent: -50,
                y:
                  grownHeight() / 2 +
                  railGap() +
                  (index > 0 ? railHeight(0) + railGap() : 0),
              });
            });

            // Stage-level overlays land exactly on the intro clusters' final
            // geometry (desktop) or the classic mobile showcase composition.
            // Positioned via left/top so the y travel tweens stay free.
            const centerTop = (element: HTMLElement) =>
              window.innerHeight / 2 - element.offsetHeight / 2;
            if (isMobile) {
              gsap.set(title, { left: 20, top: window.innerHeight * 0.16 });
              gsap.set(label, {
                left: window.innerWidth - label.offsetWidth - 20,
                top: window.innerHeight * 0.8,
              });
            } else {
              gsap.set(title, {
                left: rowLeftEdge() + introLeftWidth() - title.offsetWidth,
                top: centerTop(title),
              });
              gsap.set(label, {
                left: rowLeftEdge() + introLeftWidth() + grownWidth() + 2 * rowGap(),
                top: centerTop(label),
              });
            }
          };

          gsap.set(media, {
            autoAlpha: 0,
            clipPath: "inset(38% 42% 38% 42% round 25px)",
            height: 0,
            scale: 0.72,
            width: 0,
            y: 0,
          });
          gsap.set(rail, { y: 0 });
          gsap.set(title, { autoAlpha: 0, y: 0, yPercent: 45 });
          gsap.set(label, { autoAlpha: 0, y: 0, yPercent: 45 });
          if (takeover) gsap.set(takeover, { y: 0, yPercent: 101 });
          place();

          if (isSocial) {
            gsap.set(words, { autoAlpha: 0, yPercent: 60 });
            gsap.set(dots, { autoAlpha: 0, scale: 1.5, yPercent: 90 });
          } else {
            words.forEach((word, index) => {
              gsap.set(word, {
                autoAlpha: 0,
                rotation: WORD_TILT[index % WORD_TILT.length],
                yPercent: WORD_RISE[index % WORD_RISE.length],
              });
            });
          }

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isSocial
                ? isMobile
                  ? "+=320%"
                  : "+=450%"
                : isMobile
                  ? "+=270%"
                  : "+=380%",
              invalidateOnRefresh: true,
              onRefreshInit: place,
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // ---- intro ------------------------------------------------------
          if (isSocial) {
            tl.to(words, { autoAlpha: 1, duration: 0.4, yPercent: 0 }, 0);
            dots.forEach((dot, index) => {
              tl.to(
                dot,
                { autoAlpha: 1, duration: 0.22, ease: "power3.out", scale: 1, yPercent: 0 },
                0.3 + index * 0.14,
              );
            });
          } else {
            words.forEach((word, index) => {
              tl.to(word, { autoAlpha: 1, duration: 0.55, rotation: 0, yPercent: 0 }, index * 0.16);
            });
          }

          // ---- pop: the media enters the sentence like a word --------------
          tl.addLabel("pop", isSocial ? 0.95 : 0.85)
            .to(
              media,
              {
                autoAlpha: 1,
                duration: 0.42,
                ease: "power3.out",
                height: () => smallWidth() * SMALL_RATIO,
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

          // ---- grow: same element becomes the Example 1 frame ---------------
          const growDur = isSocial ? 1.55 : 1.3;
          tl.addLabel("grow", isSocial ? 1.5 : 1.55).to(
            media,
            {
              duration: growDur,
              ease: "power2.inOut",
              height: grownHeight,
              width: grownWidth,
            },
            "grow",
          );

          // ---- become: layered text swap in place, same geometry ------------
          const becomeAt = (isSocial ? 1.5 : 1.55) + growDur * 0.72;
          tl.addLabel("become", becomeAt)
            .to(introLeft, { autoAlpha: 0, duration: 0.45, yPercent: -35 }, "become")
            .to(title, { autoAlpha: 1, duration: 0.5, yPercent: 0 }, "become+=0.12");
          if (introRight) {
            tl.to(introRight, { autoAlpha: 0, duration: 0.45, yPercent: -35 }, "become+=0.05");
          }
          tl.to(label, { autoAlpha: 1, duration: 0.5, yPercent: 0 }, "become+=0.17");
          if (isMobile) {
            // Once the intro text is gone, recenter the media in the viewport.
            tl.to(row, { duration: 0.5, ease: "power1.inOut", x: () => -mediaCenterOffset() }, "become+=0.1");
          }

          // ---- rail: one physical strip moves through the pinned stage ------
          const railStart = becomeAt + 0.9;
          // On mobile the stage label hands off to the per-item rail labels.
          const strip = isMobile ? [media, rail] : [media, rail, label];
          const stepDur = isSocial ? 1.15 : 1.0;
          const stepGap = isSocial ? 0.55 : 0.45;

          tl.addLabel("railOne", railStart).to(
            strip,
            { duration: stepDur, ease: "power1.inOut", y: () => -stepOne() },
            "railOne",
          );
          if (isMobile) {
            tl.to(label, { autoAlpha: 0, duration: 0.3 }, "railOne");
          }
          tl.addLabel("railTwo", railStart + stepDur + stepGap).to(
            strip,
            { duration: stepDur, ease: "power1.inOut", y: () => -(stepOne() + stepTwo()) },
            "railTwo",
          );

          const settled = railStart + 2 * stepDur + stepGap;

          // ---- takeover: the black chapter physically covers the stage ------
          if (takeover) {
            tl.to(
              takeover,
              { duration: 1.4, ease: "power2.inOut", yPercent: 0 },
              settled + 0.3,
            );
          }

          tl.to({}, { duration: 0.25 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, [variant, isSocial]);

  const srText = `${isSocial ? "And... Social Presence:" : "What we do — Websites:"} ${items
    .map((item) => item.alt)
    .join(", ")}`;

  return (
    <section className={`elc-journey is-${variant}`} ref={rootRef}>
      <div className="elc-journey-stage" data-journey-stage>
        <h2 className="elc-journey-line">
          <span className="elc-sr-only">{srText}</span>
          <span aria-hidden="true" className="elc-journey-row" data-journey-row>
            <span className="elc-journey-intro" data-intro-left>
              {isSocial ? (
                <span className="elc-journey-word" data-journey-word>
                  And
                  <span data-journey-dot>.</span>
                  <span data-journey-dot>.</span>
                  <span data-journey-dot>.</span>
                </span>
              ) : (
                <>
                  <span className="elc-journey-word" data-journey-word>
                    What
                  </span>{" "}
                  <span className="elc-journey-word" data-journey-word>
                    we
                  </span>
                </>
              )}
            </span>
            <figure className="elc-journey-media" data-journey-media>
              <Image
                alt=""
                height={533}
                sizes="(max-width: 767px) 100vw, 50vw"
                src={items[0].src}
                style={{ height: "100%", objectFit: "cover", width: "100%" }}
                width={946}
              />
            </figure>
            {isSocial ? null : (
              <span className="elc-journey-intro" data-intro-right>
                <span className="elc-journey-word" data-journey-word>
                  do
                </span>
              </span>
            )}
          </span>
          {/* Static clones used only for measurements — never animated. */}
          <span aria-hidden="true" className="elc-journey-row is-measure">
            <span data-measure-left>{isSocial ? "And..." : "What we"}</span>
            <span data-measure-right>{isSocial ? "" : "do"}</span>
          </span>
        </h2>

        {/* Stage-level text states: positioned onto the intro's final
            geometry by the timeline, so the swap shares the same box. */}
        <span aria-hidden="true" className="elc-journey-title" data-journey-title>
          {TITLES[variant]}
        </span>
        <span aria-hidden="true" className="elc-journey-label" data-journey-label>
          {items[0].label}
        </span>

        <div aria-hidden="true" className="elc-journey-rail" data-journey-rail>
          {items.slice(1).map((item) => (
            <figure className="elc-journey-rail-item" data-rail-item key={item.label}>
              <div className="elc-journey-rail-media">
                <Image
                  alt=""
                  fill
                  sizes="(max-width: 767px) 82vw, 44vw"
                  src={item.src}
                />
              </div>
              <span className="elc-journey-rail-label">{item.label}</span>
            </figure>
          ))}
        </div>

        {isSocial ? <div className="elc-takeover elc-takeover-dark" data-takeover /> : null}
      </div>
    </section>
  );
}
