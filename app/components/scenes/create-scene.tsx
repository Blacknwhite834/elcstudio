"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ContactForm from "../contact-form";
import { CREATE_GLYPHS } from "./create-glyphs";
import { createCards, createLetterMedia, type CreateLetter } from "./data";

// "yours." split for the per-letter media portal. The tile of each letter
// shows the same asset as the card it later escapes into.
const YOURS_LETTERS = ["y", "o", "u", "r", "s", "dot"] as const;
type YoursLetter = (typeof YOURS_LETTERS)[number];

const CARD_CLASS: Record<string, string> = {
  hero: "is-hero",
  vertical: "is-vertical",
  frameA: "is-frame-a",
  frameB: "is-frame-b",
  detail1: "is-detail-1",
  detail2: "is-detail-2",
  detail3: "is-detail-3",
};

// Only the five cards tied to the five letters enter this sequence. This
// keeps the transition legible: one letter becomes one image.
const portalCards = createCards.filter((card) => card.from);

type Box = { cx: number; cy: number; w: number; h: number };

export default function CreateScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mediaContext: ReturnType<typeof gsap.matchMedia> | undefined;
    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-create-stage]");
      const qInner = root.querySelector<HTMLElement>("[data-q-inner]");
      const qWords = gsap.utils.toArray<HTMLElement>("[data-q-word]", root);
      const aClip = root.querySelector<HTMLElement>("[data-a-clip]");
      const aInner = root.querySelector<HTMLElement>("[data-a-inner]");
      const wordInners = gsap.utils.toArray<HTMLElement>("[data-word-inner]", root);
      const yoursText = root.querySelector<HTMLElement>("[data-yours-text]");
      const letterSpans = gsap.utils.toArray<HTMLElement>("[data-letter]", root);
      const probe = root.querySelector<HTMLElement>("[data-baseline-probe]");
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", root);
      const tileMedia = gsap.utils.toArray<HTMLElement>("[data-tile] img", root);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
      const dot = root.querySelector<HTMLElement>("[data-accent-dot]");
      const closingLine = root.querySelector<HTMLElement>("[data-closing-line]");
      const phrases = gsap.utils.toArray<HTMLElement>("[data-closing-phrase]", root);
      const slot = root.querySelector<HTMLElement>("[data-form-slot]");
      const formWrap = root.querySelector<HTMLElement>("[data-form-wrap]");
      if (
        !stage ||
        !qInner ||
        !aClip ||
        !aInner ||
        wordInners.length < 3 ||
        !yoursText ||
        !probe ||
        !dot ||
        !closingLine ||
        phrases.length < 3 ||
        !slot ||
        !formWrap
      ) {
        return;
      }

      const yoursInner = wordInners[2];
      const [p0, p1, p2] = phrases;
      const tileByLetter = new Map<string, HTMLElement>();
      tiles.forEach((tile) => tileByLetter.set(tile.dataset.tile ?? "", tile));

      // ---- FLIP geometry, cached from clean layout rects -----------------
      // The portal grows beyond the subtle word emphasis, but remains part of
      // the sentence instead of becoming a full-screen isolated word.
      let yoursScale = 1.32;
      let emphasisScales = [1.22, 1.18, 1.26];
      let stageCX = 0;
      let stageCY = 0;
      const letterWorld = new Map<YoursLetter, Box>();
      const cardGeom = new Map<HTMLElement, Box>();
      const cardEscape = new Map<HTMLElement, { x: number; y: number; scale: number }>();
      let dotStart = { x: 0, y: 0, scale: 1 };
      let cX0 = 0;
      let cX1 = 0;
      let cX2 = 0;
      let miniX = 0;
      let miniY = 0;
      let miniScale = 0.1;

      const measure = () => {
        // Reset every transform read below; hidden states (autoAlpha) are
        // deliberately left alone so pre-reveal elements stay invisible.
        gsap.set(aInner, { y: 0 });
        gsap.set(wordInners, { scale: 1, x: 0, y: 0 });
        gsap.set(cards, { rotation: 0, scale: 1, x: 0, y: 0 });
        gsap.set(dot, { scale: 1, x: 0, y: 0 });
        gsap.set(closingLine, { x: 0 });
        gsap.set(formWrap, { scale: 1, x: 0, y: 0 });

        const stageR = stage.getBoundingClientRect();
        stageCX = stageR.left + stageR.width / 2;
        stageCY = stageR.top + stageR.height / 2;

        // Letter ink boxes: span rect gives the advance origin, the zero-size
        // probe gives the baseline, the generated glyph bbox does the rest.
        const yoursR = yoursInner.getBoundingClientRect();
        const yoursCX = yoursR.left + yoursR.width / 2;
        const yoursCY = yoursR.top + yoursR.height / 2;
        const baselineY = probe.getBoundingClientRect().top;
        const fontSize = parseFloat(getComputedStyle(yoursInner).fontSize);
        letterSpans.forEach((span) => {
          const key = span.dataset.letter as YoursLetter;
          const glyph = CREATE_GLYPHS[key];
          const tile = tileByLetter.get(key);
          if (!glyph || !tile) return;
          const r = span.getBoundingClientRect();
          const left = r.left + glyph.x1 * fontSize;
          const top = baselineY + glyph.y1 * fontSize;
          const w = (glyph.x2 - glyph.x1) * fontSize;
          const h = (glyph.y2 - glyph.y1) * fontSize;
          gsap.set(tile, {
            height: h,
            left: left - yoursR.left,
            top: top - yoursR.top,
            width: w,
          });
          // Viewport-space box once "yours." expands in place. Keeping the
          // real inline word as the origin avoids a disconnected center jump.
          letterWorld.set(key, {
            cx: yoursCX + (left + w / 2 - yoursCX) * yoursScale,
            cy: yoursCY + (top + h / 2 - yoursCY) * yoursScale,
            h: h * yoursScale,
            w: w * yoursScale,
          });
        });

        // Editorial grid destinations + cover-fit escape starts.
        cardGeom.clear();
        cardEscape.clear();
        cards.forEach((card) => {
          if (card.offsetWidth === 0) return; // display:none on this breakpoint
          const r = card.getBoundingClientRect();
          const geom = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height, w: r.width };
          cardGeom.set(card, geom);
          const from = card.dataset.from as CreateLetter | undefined;
          const world = from ? letterWorld.get(from) : undefined;
          if (world) {
            cardEscape.set(card, {
              scale: Math.max(world.w / r.width, world.h / r.height),
              x: world.cx - geom.cx,
              y: world.cy - geom.cy,
            });
          }
        });

        // Accent dot: born from the period and becomes the calm center point
        // of the editorial composition.
        const dotR = dot.getBoundingClientRect();
        const dotW = dotR.width || 1;
        const period = letterWorld.get("dot");
        if (period) {
          dotStart = {
            scale: period.w / dotW,
            x: period.cx - stageCX,
            y: period.cy - stageCY,
          };
        }

        // Closing line centering, restored from the original connect scene.
        const p0R = p0.getBoundingClientRect();
        const p1R = p1.getBoundingClientRect();
        const p2R = p2.getBoundingClientRect();
        const slotR = slot.getBoundingClientRect();
        const wrapR = formWrap.getBoundingClientRect();
        cX0 = stageCX - (p0R.left + p0R.right) / 2;
        cX1 = stageCX - (p0R.left + p1R.right) / 2;
        cX2 = stageCX - (p0R.left + p2R.right) / 2;
        // Min-fit keeps the mini undistorted on every viewport.
        miniScale = Math.min(slotR.width / wrapR.width, slotR.height / wrapR.height);
        miniX = slotR.left + slotR.width / 2 + cX2 - (wrapR.left + wrapR.width / 2);
        miniY = slotR.top + slotR.height / 2 - (wrapR.top + wrapR.height / 2);
      };

      // Interactivity is derived deterministically from timeline time, so it
      // reverses cleanly and never blocks the form after the morph.
      let interactive: boolean | null = null;
      const setInteractive = (on: boolean) => {
        if (on === interactive) return;
        interactive = on;
        formWrap.style.pointerEvents = on ? "auto" : "none";
        if (on) formWrap.removeAttribute("inert");
        else formWrap.setAttribute("inert", "");
      };
      setInteractive(false);

      mediaContext = gsap.matchMedia();

      mediaContext.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          // Light inline emphasis: the active word gains presence while the
          // rest of the sentence stays readable and moves with it.
          emphasisScales = isMobile ? [1.12, 1.1, 1.16] : [1.22, 1.18, 1.26];
          yoursScale = isMobile ? 1.24 : 1.32;
          const secondaryOpacity = isMobile ? 0.58 : 0.62;
          const climaxSecondaryOpacity = isMobile ? 0.5 : 0.54;
          const nudge = isMobile ? 8 : 24;

          // Pre-reveal states. measure() never resets autoAlpha, so these
          // survive every refresh.
          gsap.set(qInner, { autoAlpha: 0, y: "0.45em" });
          gsap.set(aInner, { autoAlpha: 0 });
          gsap.set(wordInners, { transformOrigin: "50% 50%" });
          gsap.set(tiles, { autoAlpha: 0 });
          gsap.set(tileMedia, { scale: 1.15, transformOrigin: "50% 50%" });
          gsap.set(cards, { autoAlpha: 0, transformOrigin: "50% 50%" });
          // Overscan so the internal crop drift never exposes container edges.
          gsap.set(gsap.utils.toArray<HTMLElement>("[data-card] img, [data-card] video", root), {
            scale: 1.1,
            transformOrigin: "50% 50%",
          });
          gsap.set(dot, { autoAlpha: 0 });
          gsap.set(phrases, { autoAlpha: 0, rotation: 1.4, yPercent: 60 });
          gsap.set(formWrap, { autoAlpha: 0, transformOrigin: "50% 50%" });

          let interactiveAt = Infinity;

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=1200%" : "+=1500%",
              invalidateOnRefresh: true,
              onRefreshInit: measure,
              onUpdate: () => setInteractive(tl.time() >= interactiveAt),
              pin: true,
              scrub: isMobile ? 1 : 1.15,
              start: "top top",
              trigger: stage,
            },
          });

          // ---- 1. question: calm rise through the clipping mask ----------
          tl.addLabel("question", 0.4).fromTo(
            qInner,
            { autoAlpha: 0, y: "0.45em" },
            { autoAlpha: 1, duration: 2.2, ease: "power2.out", y: 0 },
            "question",
          );
          // hold: readable until the transformation begins.

          // ---- 2. question -> answer in the same centered area -----------
          tl.addLabel("answer", 4.2)
            .to(qWords, { color: "#a7a7a7", duration: 0.8, ease: "power1.inOut", stagger: 0.06 }, "answer")
            .to(
              qInner,
              { autoAlpha: 0, duration: 1.2, ease: "power2.inOut", scale: 0.97, y: "-0.6em" },
              "answer+=0.5",
            )
            .fromTo(
              aInner,
              { autoAlpha: 0, y: "0.5em" },
              { autoAlpha: 1, duration: 1.4, ease: "power2.out", y: 0 },
              "answer+=1.0",
            );
          // Settled at 6.6: the exact Figma 151:18 state. Hold to 8.6.

          // Release the reveal mask before words scale beyond the line box.
          tl.set(aClip, { overflow: "visible" }, 8.4);

          // ---- 3. word-by-word emphasis (transform scale only) ------------
          tl.addLabel("w1", 8.6)
            .to(
              wordInners[0],
              {
                duration: 2.2,
                ease: "sine.inOut",
                scale: emphasisScales[0],
                x: -nudge * 0.45,
              },
              "w1",
            )
            .to(
              wordInners[1],
              {
                autoAlpha: secondaryOpacity,
                duration: 1.8,
                ease: "sine.inOut",
                scale: 0.98,
                x: nudge * 0.8,
              },
              "w1",
            )
            .to(
              wordInners[2],
              {
                autoAlpha: secondaryOpacity,
                duration: 1.8,
                ease: "sine.inOut",
                scale: 0.98,
                x: nudge,
              },
              "w1",
            )
            // hold, then return while truly rises.
            .to(wordInners[0], { duration: 1.8, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, 12)
            .to(
              [wordInners[1], wordInners[2]],
              { autoAlpha: 1, duration: 1.6, ease: "sine.inOut", scale: 1, x: 0, y: 0 },
              12,
            );

          tl.addLabel("w2", 13.6)
            .to(
              wordInners[1],
              {
                duration: 2.2,
                ease: "sine.inOut",
                scale: emphasisScales[1],
              },
              "w2",
            )
            .to(
              wordInners[0],
              {
                autoAlpha: secondaryOpacity,
                duration: 1.8,
                ease: "sine.inOut",
                scale: 0.98,
                x: -nudge,
              },
              "w2",
            )
            .to(
              wordInners[2],
              {
                autoAlpha: secondaryOpacity,
                duration: 1.8,
                ease: "sine.inOut",
                scale: 0.98,
                x: nudge,
              },
              "w2",
            )
            .to(wordInners[1], { duration: 1.8, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, 17)
            .to(
              [wordInners[0], wordInners[2]],
              { autoAlpha: 1, duration: 1.6, ease: "sine.inOut", scale: 1, x: 0, y: 0 },
              17,
            );

          tl.addLabel("w3", 18.6)
            .to(
              wordInners[2],
              {
                autoAlpha: 1,
                duration: 2.4,
                ease: "sine.inOut",
                scale: emphasisScales[2],
                x: nudge * 0.45,
              },
              "w3",
            )
            .to(
              wordInners[0],
              {
                autoAlpha: climaxSecondaryOpacity,
                duration: 2,
                ease: "sine.inOut",
                scale: 0.98,
                x: -nudge,
              },
              "w3",
            )
            .to(
              wordInners[1],
              {
                autoAlpha: climaxSecondaryOpacity,
                duration: 2,
                ease: "sine.inOut",
                scale: 0.98,
                x: -nudge * 0.55,
              },
              "w3",
            );
          // A quiet hold lets the final word land before it becomes imagery.

          // ---- 4. media appears inside the letterforms of "yours." --------
          tl.addLabel("portal", 22)
            .to(
              yoursInner,
              { duration: 2.8, ease: "sine.inOut", scale: () => yoursScale, x: 0 },
              "portal",
            )
            .to(
              [wordInners[0], wordInners[1]],
              {
                autoAlpha: 0.44,
                duration: 2.2,
                ease: "sine.inOut",
                scale: 0.97,
                x: -nudge * 0.8,
              },
              "portal",
            )
            .to(tiles, { autoAlpha: 1, duration: 1.4, ease: "sine.inOut", stagger: 0.1 }, "portal+=0.8")
            .to(letterSpans, { duration: 1.6, ease: "sine.inOut", opacity: 0.18 }, "portal+=0.9")
            .to(
              tileMedia,
              { duration: 4.2, ease: "none", stagger: 0.1, yPercent: -2 },
              "portal+=1",
            );

          // ---- 5. each letter becomes its matching editorial image --------
          tl.addLabel("assemble", 26);
          const orderedCards = [...cards].sort((a, b) => {
            const aIndex = YOURS_LETTERS.indexOf((a.dataset.from ?? "dot") as YoursLetter);
            const bIndex = YOURS_LETTERS.indexOf((b.dataset.from ?? "dot") as YoursLetter);
            return aIndex - bIndex;
          });
          orderedCards.forEach((card, index) => {
            const esc = cardEscape.get(card);
            const from = card.dataset.from as CreateLetter | undefined;
            if (esc && from) {
              const at = `assemble+=${index * 0.45}`;
              tl.fromTo(
                card,
                {
                  rotation: 0,
                  scale: () => cardEscape.get(card)?.scale ?? 0.2,
                  x: () => cardEscape.get(card)?.x ?? 0,
                  y: () => cardEscape.get(card)?.y ?? 0,
                },
                {
                  duration: 3.4,
                  ease: "sine.inOut",
                  immediateRender: false,
                  rotation: 0,
                  scale: 1,
                  x: 0,
                  y: 0,
                },
                at,
              );
              tl.set(card, { visibility: "visible" }, at);
              tl.to(card, { duration: 1.4, ease: "sine.inOut", opacity: 1 }, at);
              // The tile fades only after the card is opaque on top of it:
              // both layers show the same asset, so the letter reads as the
              // origin of one continuous object.
              tl.to(
                tileByLetter.get(from) ?? [],
                { autoAlpha: 0, duration: 0.8 },
                `assemble+=${index * 0.45 + 1.2}`,
              );
            }
          });
          // The period becomes a calm anchor instead of travelling randomly.
          tl.fromTo(
            dot,
            { scale: () => dotStart.scale, x: () => dotStart.x, y: () => dotStart.y },
            { autoAlpha: 1, duration: 1.2, ease: "sine.inOut" },
            "assemble+=0.8",
          )
            .to(tileByLetter.get("dot") ?? [], { autoAlpha: 0, duration: 0.8 }, "assemble+=1.2")
            .to(dot, { duration: 3.8, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, "assemble+=1")
            .to([wordInners[0], wordInners[1]], { autoAlpha: 0, duration: 1.8 }, "assemble+=0.7")
            .to(yoursText, { duration: 2, opacity: 0 }, "assemble+=1.1")
            .to(tiles, { autoAlpha: 0, duration: 1 }, "assemble+=4.2");

          // ---- 6. the finished composition breathes as one calm scene -----
          tl.addLabel("gallery", 31.5);
          const heroCard = cards.find((card) => card.dataset.card === "hero");
          if (heroCard) {
            tl.to(heroCard, { duration: 5, ease: "sine.inOut", scale: 1.025 }, "gallery");
          }
          tl.to(
            gsap.utils.toArray<HTMLElement>("[data-card] img, [data-card] video", root),
            { duration: 5, ease: "none", scale: 1.04, yPercent: -2 },
            "gallery",
          );

          // The composition exits together, preserving the sense of one idea.
          tl.addLabel("galleryOut", 37)
            .to(
              cards,
              {
                autoAlpha: 0,
                duration: 2.2,
                ease: "sine.inOut",
                scale: 0.97,
                stagger: { amount: 0.35, from: "center" },
                y: -12,
              },
              "galleryOut",
            )
            .to(dot, { autoAlpha: 0, duration: 1.4, ease: "sine.inOut" }, "galleryOut+=0.4");

          // ---- original connect beat: calm sentence, then the real form ---
          tl.addLabel("closing", 40.5)
            .fromTo(closingLine, { x: () => cX0 }, { duration: 0.01, x: () => cX0 }, "closing")
            .to(p0, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "closing");

          tl.addLabel("soooo", 43)
            .to(closingLine, { duration: 0.9, ease: "sine.inOut", x: () => cX1 }, "soooo")
            .to(p1, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "soooo+=0.15");

          tl.addLabel("connect", 45.8)
            .to(closingLine, { duration: 0.9, ease: "sine.inOut", x: () => cX2 }, "connect")
            .to(p2, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "connect+=0.15");

          // The miniature is the real form, as in the previous scene.
          tl.addLabel("mini", 48.5).fromTo(
            formWrap,
            { autoAlpha: 0, scale: () => miniScale * 0.9, x: () => miniX, y: () => miniY },
            {
              autoAlpha: 1,
              duration: 0.8,
              ease: "sine.out",
              scale: () => miniScale,
              x: () => miniX,
              y: () => miniY,
            },
            "mini",
          );

          // Original soft expansion from the inline slot to the full form.
          tl.addLabel("morph", 50.2)
            .to(formWrap, { duration: 2, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, "morph")
            .to(
              closingLine,
              { autoAlpha: 0, duration: 1, ease: "sine.in", yPercent: -12 },
              "morph+=0.5",
            );

          interactiveAt = (tl.labels as Record<string, number>).morph + 2;

          // Settled hold; the footer rises over the last stretch of this.
          tl.to({}, { duration: 7 });
        },
      );
    }, root);

    return () => {
      mediaContext?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section aria-labelledby="create-title" className="elc-create" id="contact" ref={rootRef}>
      <h2 className="elc-sr-only" id="create-title">
        Contact
      </h2>

      {/* Inter Medium letterform clips for the "yours." media portal. */}
      <svg aria-hidden="true" focusable="false" height="0" width="0">
        <defs>
          {YOURS_LETTERS.map((letter) => (
            <clipPath clipPathUnits="objectBoundingBox" id={`elc-glyph-${letter}`} key={letter}>
              <path d={CREATE_GLYPHS[letter].d} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="elc-create-stage" data-create-stage>
        <p className="elc-create-heading">
          <span className="elc-sr-only">
            What could we create together? Something truly yours. Sooooo.... Let’s connect.
          </span>

          <span aria-hidden="true" className="elc-create-clip" data-q-clip>
            <span className="elc-create-line" data-q-inner>
              <span className="elc-create-qword" data-q-word>
                What
              </span>{" "}
              <span className="elc-create-qword" data-q-word>
                could
              </span>{" "}
              <span className="elc-create-qword" data-q-word>
                we
              </span>{" "}
              <span className="elc-create-qword" data-q-word>
                create
              </span>{" "}
              <span className="elc-create-qword" data-q-word>
                together?
              </span>
            </span>
          </span>

          <span aria-hidden="true" className="elc-create-clip" data-a-clip>
            <span className="elc-create-line elc-create-answer" data-a-inner>
              <span className="elc-create-word">
                <span className="elc-create-word-inner" data-word-inner>
                  Something
                </span>
              </span>{" "}
              <span className="elc-create-word">
                <span className="elc-create-word-inner" data-word-inner>
                  truly
                </span>
              </span>{" "}
              <span className="elc-create-word is-accent">
                <span className="elc-create-word-inner" data-word-inner>
                  <span className="elc-yours-text" data-yours-text>
                    <span data-letter="y">y</span>
                    <span data-letter="o">o</span>
                    <span data-letter="u">u</span>
                    <span data-letter="r">r</span>
                    <span data-letter="s">s</span>
                    <span data-letter="dot">.</span>
                    <span className="elc-baseline-probe" data-baseline-probe />
                  </span>
                  <span className="elc-yours-portal" data-portal>
                    {(["y", "o", "u", "r", "s"] as CreateLetter[]).map((letter) => (
                      <span
                        className="elc-letter-tile"
                        data-tile={letter}
                        key={letter}
                        style={{ clipPath: `url(#elc-glyph-${letter})` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt=""
                          loading="lazy"
                          src={createLetterMedia[letter].src}
                          style={{ objectPosition: createLetterMedia[letter].objectPosition }}
                        />
                      </span>
                    ))}
                    <span
                      className="elc-letter-tile is-dot"
                      data-tile="dot"
                      style={{ clipPath: "url(#elc-glyph-dot)" }}
                    />
                  </span>
                </span>
              </span>
            </span>
          </span>
        </p>

        <div aria-hidden="true" className="elc-create-grid" data-grid>
          {portalCards.map((card) => (
            <figure
              className={`elc-create-card ${CARD_CLASS[card.id]}`}
              data-card={card.id}
              data-depth={card.depth}
              data-from={card.from}
              key={card.id}
            >
              {card.videoMp4Src ? (
                <video
                  data-motion-video
                  loop
                  muted
                  playsInline
                  poster={card.posterSrc}
                  preload="none"
                >
                  {card.videoWebmSrc ? <source src={card.videoWebmSrc} type="video/webm" /> : null}
                  <source src={card.videoMp4Src} type="video/mp4" />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  loading="lazy"
                  src={card.src}
                  style={{ objectPosition: card.objectPosition }}
                />
              )}
            </figure>
          ))}
        </div>

        <span aria-hidden="true" className="elc-create-dot" data-accent-dot />

        <p className="elc-closing-heading">
          <span aria-hidden="true" className="elc-closing-line" data-closing-line>
            <span className="elc-closing-phrase" data-closing-phrase>
              That’s all.
            </span>{" "}
            <span className="elc-closing-phrase" data-closing-phrase>
              Sooooo....
            </span>{" "}
            <span className="elc-closing-phrase elc-accent" data-closing-phrase>
              Let’s connect
            </span>
            <span className="elc-form-slot" data-form-slot />
          </span>
        </p>

        <div className="elc-contact-form-wrap" data-form-wrap>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
