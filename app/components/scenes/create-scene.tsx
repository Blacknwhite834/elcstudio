"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ContactForm from "../contact-form";
import { createCards, type CreateCard } from "./data";

const CARD_CLASS: Record<string, string> = {
  hero: "is-hero",
  vertical: "is-vertical",
  frameA: "is-frame-a",
  frameB: "is-frame-b",
  detail1: "is-detail-1",
  detail2: "is-detail-2",
  detail3: "is-detail-3",
  square: "is-square",
  capsule: "is-capsule",
};

const cardById = new Map<string, CreateCard>(createCards.map((card) => [card.id, card]));

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
      const aInner = root.querySelector<HTMLElement>("[data-a-inner]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
      const cardMedia = gsap.utils.toArray<HTMLElement>("[data-card] img, [data-card] video", root);
      const closingLine = root.querySelector<HTMLElement>("[data-closing-line]");
      const phrases = gsap.utils.toArray<HTMLElement>("[data-closing-phrase]", root);
      const slot = root.querySelector<HTMLElement>("[data-form-slot]");
      const formWrap = root.querySelector<HTMLElement>("[data-form-wrap]");
      if (
        !stage ||
        !qInner ||
        !aInner ||
        cards.length === 0 ||
        !closingLine ||
        phrases.length < 3 ||
        !slot ||
        !formWrap
      ) {
        return;
      }

      const [p0, p1, p2] = phrases;

      // ---- geometry, cached from clean layout rects (re-run on refresh) -----
      let stageCX = 0;
      let stageCY = 0;
      // Deterministic, art-directed landing offsets — never random. Items
      // enter from these offsets and later leave back toward them.
      const cardEnter = new Map<HTMLElement, { x: number; y: number; rotate: number }>();
      let cX0 = 0;
      let cX1 = 0;
      let cX2 = 0;
      let miniX = 0;
      let miniY = 0;
      let miniScale = 0.1;

      const measure = () => {
        // Zero the transform channels GSAP owns so the reads below are clean.
        // Hidden states (autoAlpha) are deliberately left untouched.
        gsap.set(aInner, { scale: 1, y: 0 });
        gsap.set(cards, { rotation: 0, scale: 1, x: 0, y: 0 });
        gsap.set(closingLine, { x: 0 });
        gsap.set(formWrap, { scale: 1, x: 0, y: 0 });

        const stageR = stage.getBoundingClientRect();
        stageCX = stageR.left + stageR.width / 2;
        stageCY = stageR.top + stageR.height / 2;

        // Travel scales with the viewport so motion stays proportional and the
        // items never overshoot off a small screen.
        const vp = gsap.utils.clamp(0.5, 1, window.innerWidth / 1920);

        cardEnter.clear();
        cards.forEach((card) => {
          const spec = cardById.get(card.dataset.card ?? "");
          if (!spec) return;
          const dist = spec.enter.dist * vp;
          let ex = 0;
          let ey = 0;
          switch (spec.enter.dir) {
            case "top":
              ey = -dist;
              break;
            case "bottom":
              ey = dist;
              break;
            case "left":
              ex = -dist;
              ey = -18 * vp;
              break;
            case "right":
              ex = dist;
              ey = -18 * vp;
              break;
            case "lift":
              ey = dist;
              break;
          }
          cardEnter.set(card, { rotate: spec.enter.rotate, x: ex, y: ey });
        });

        // Closing-line centering + the miniature form footprint.
        const p0R = p0.getBoundingClientRect();
        const p1R = p1.getBoundingClientRect();
        const p2R = p2.getBoundingClientRect();
        const slotR = slot.getBoundingClientRect();
        const wrapR = formWrap.getBoundingClientRect();
        cX0 = stageCX - (p0R.left + p0R.right) / 2;
        cX1 = stageCX - (p0R.left + p1R.right) / 2;
        cX2 = stageCX - (p0R.left + p2R.right) / 2;
        miniScale = Math.min(slotR.width / wrapR.width, slotR.height / wrapR.height);
        miniX = slotR.left + slotR.width / 2 + cX2 - (wrapR.left + wrapR.width / 2);
        miniY = slotR.top + slotR.height / 2 - (wrapR.top + wrapR.height / 2);
      };

      // Interactivity is derived from timeline time so it reverses cleanly and
      // never blocks the form after the morph.
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

          // Pre-reveal states. measure() never resets autoAlpha, so these
          // survive every refresh.
          gsap.set(qInner, { autoAlpha: 0, y: "0.45em" });
          gsap.set(aInner, { autoAlpha: 0, y: "0.5em" });
          gsap.set(cards, { autoAlpha: 0, transformOrigin: "50% 50%" });
          // Overscan so the internal crop drift never exposes container edges.
          gsap.set(cardMedia, { scale: 1.08, transformOrigin: "50% 50%" });
          gsap.set(phrases, { autoAlpha: 0, rotation: 1.4, yPercent: 60 });
          gsap.set(formWrap, { autoAlpha: 0, transformOrigin: "50% 50%" });

          let interactiveAt = Infinity;

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=1150%" : "+=1500%",
              invalidateOnRefresh: true,
              onRefreshInit: measure,
              onUpdate: () => setInteractive(tl.time() >= interactiveAt),
              pin: true,
              scrub: isMobile ? 1 : 1.15,
              start: "top top",
              trigger: stage,
            },
          });

          // ---- 1. question: calm rise through the clipping mask ------------
          tl.addLabel("question", 0.4).fromTo(
            qInner,
            { autoAlpha: 0, y: "0.45em" },
            { autoAlpha: 1, duration: 2.2, ease: "power2.out", y: 0 },
            "question",
          );
          // hold: readable before the answer replaces it.

          // ---- 2. question -> answer in the same centered area -------------
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
          // The complete answer holds clearly, then clears out — the gallery
          // plays on its own, with no text over it.
          tl.to(aInner, { autoAlpha: 0, duration: 1.1, ease: "sine.inOut" }, 7.6);

          // ---- 3. the gallery drops in — items appear near-together, not one
          // by one. Each still carries a short explicit bounce (arrival ->
          // overshoot -> settle) since the timeline is scrubbed.
          const galleryIn = 9;
          const stIn = isMobile ? 0.16 : 0.12; // tight stagger: they land together
          const ordered = [...cards].sort(
            (a, b) =>
              (cardById.get(a.dataset.card ?? "")?.order ?? 0) -
              (cardById.get(b.dataset.card ?? "")?.order ?? 0),
          );

          ordered.forEach((card, i) => {
            const spec = cardById.get(card.dataset.card ?? "");
            const rest = spec?.rest ?? 0;
            const at = galleryIn + i * stIn;
            tl.fromTo(
              card,
              {
                autoAlpha: 0,
                rotation: () => cardEnter.get(card)?.rotate ?? 0,
                scale: 0.9,
                x: () => cardEnter.get(card)?.x ?? 0,
                y: () => cardEnter.get(card)?.y ?? 0,
              },
              {
                autoAlpha: 1,
                duration: 1.1,
                ease: "power2.out",
                immediateRender: false,
                rotation: rest,
                scale: 1.02,
                x: 0,
                y: -8,
              },
              at,
            )
              // secondary correction — a few pixels past, then back.
              .to(card, { duration: 0.4, ease: "power1.inOut", scale: 0.995, y: 3 }, at + 1.1)
              // soft settling.
              .to(card, { duration: 0.4, ease: "power1.inOut", scale: 1, y: 0 }, at + 1.5);
          });

          // ---- 4. the finished composition breathes as one calm scene ------
          const galleryHold = galleryIn + ordered.length * stIn + 2;
          tl.addLabel("hold", galleryHold);
          const heroCard = cards.find((card) => card.dataset.card === "hero");
          if (heroCard) {
            tl.to(heroCard, { duration: 4, ease: "sine.inOut", scale: 1.02 }, "hold");
          }
          // Only the internal media drifts; the containers stay stable.
          tl.to(cardMedia, { duration: 4.5, ease: "none", scale: 1.12, yPercent: -2 }, "hold");

          // ---- 5. items leave the way they came — back toward their entry
          // offsets, near-together — before the contact beat.
          const galleryOut = galleryHold + 4;
          const stOut = isMobile ? 0.14 : 0.1;
          tl.addLabel("galleryOut", galleryOut);
          ordered.forEach((card, i) => {
            tl.to(
              card,
              {
                autoAlpha: 0,
                duration: 1.3,
                ease: "power2.in",
                rotation: () => cardEnter.get(card)?.rotate ?? 0,
                scale: 0.9,
                x: () => cardEnter.get(card)?.x ?? 0,
                y: () => cardEnter.get(card)?.y ?? 0,
              },
              galleryOut + i * stOut,
            );
          });

          // ---- 6. the closing line, then the real contact form -------------
          const closing = galleryOut + ordered.length * stOut + 1.6;
          tl.addLabel("closing", closing)
            .set(closingLine, { x: () => cX0 }, "closing")
            .to(p0, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "closing");

          tl.addLabel("soooo", closing + 2)
            .to(closingLine, { duration: 0.9, ease: "sine.inOut", x: () => cX1 }, "soooo")
            .to(p1, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "soooo+=0.15");

          tl.addLabel("connect", closing + 4)
            .to(closingLine, { duration: 0.9, ease: "sine.inOut", x: () => cX2 }, "connect")
            .to(p2, { autoAlpha: 1, duration: 0.85, ease: "sine.out", rotation: 0, yPercent: 0 }, "connect+=0.15");

          // The miniature form grows from the closing line into the full form.
          const mini = closing + 5.5;
          tl.addLabel("mini", mini).fromTo(
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

          tl.addLabel("morph", mini + 2)
            .to(formWrap, { duration: 2, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, "morph")
            .to(closingLine, { autoAlpha: 0, duration: 1, ease: "sine.in", yPercent: -12 }, "morph+=0.5");

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

          <span aria-hidden="true" className="elc-create-clip">
            <span className="elc-create-line elc-create-answer" data-a-inner>
              <span className="elc-create-word">Something</span>{" "}
              <span className="elc-create-word">truly</span>{" "}
              <span className="elc-create-word is-accent">yours.</span>
            </span>
          </span>
        </p>

        <div aria-hidden="true" className="elc-create-grid" data-grid>
          {createCards.map((card) => (
            <figure
              className={`elc-create-card ${CARD_CLASS[card.id]}`}
              data-card={card.id}
              data-depth={card.depth}
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
