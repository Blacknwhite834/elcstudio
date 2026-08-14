"use client";

import { useEffect, useRef } from "react";
import { gsap, MotionPathPlugin } from "../../lib/gsap";
import ContactForm from "../contact-form";
import { createCards, driftPaths, STREAM_END, type CreateCard } from "./data";

const cardById = new Map<string, CreateCard>(createCards.map((card) => [card.id, card]));

/** Shared by the tween and the clearance solver, so the curve we verify is
 *  exactly the curve GSAP draws. */
const CURVINESS = 1.15;

type Pt = { x: number; y: number };

// The reference is flat and editorial: the interest is the curved right-to-left
// travel and the differing card formats, not perspective. So there is no depth
// system — every item runs at full opacity and its scale barely moves.
const SCALE_IN = 0.985;
const SCALE_MID = 1.01;
const SCALE_OUT = 0.99;

/** Point on the cubic starting at index `i` of a flat GSAP segment array. */
function cubicAt(seg: number[], i: number, t: number): Pt {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * seg[i] + b * seg[i + 2] + c * seg[i + 4] + d * seg[i + 6],
    y: a * seg[i + 1] + b * seg[i + 3] + c * seg[i + 5] + d * seg[i + 7],
  };
}

/**
 * Keeps a trajectory outside the headline's protected zone — not by hoping the
 * anchors are high enough, but by sampling the curve GSAP will actually draw
 * and pushing the offending anchors out until it clears. Runs on refresh only.
 */
function solveClearance(
  points: Pt[],
  opts: { bandX: number; inner: number; outer: number; up: boolean },
) {
  const { bandX, inner, outer, up } = opts;

  // Anchors inside the protected band take the full correction; their
  // immediate neighbours take part of it. Without that, the curve is lifted
  // over the zone but still descends into its corner on the way in or out,
  // because the neighbouring anchor keeps pulling the tangent down.
  const inBand = points.map((p) => Math.abs(p.x) < bandX);
  const weight = points.map((_, i) =>
    inBand[i] ? 1 : inBand[i - 1] || inBand[i + 1] ? 0.55 : 0,
  );

  // First pull anchors back in if the authored arc would fling this card too
  // far off-stage; the clearance pass below then pushes back only as far as
  // readability actually demands.
  points.forEach((p, i) => {
    if (!inBand[i]) return;
    p.y = up ? Math.max(p.y, outer) : Math.min(p.y, outer);
  });

  for (let pass = 0; pass < 4; pass += 1) {
    // pointsToSegment takes a flat [x,y,x,y,…] list and hands back the cubic
    // control points GSAP itself will tween along — so we verify the real
    // curve, not an approximation of it.
    const flat: number[] = [];
    points.forEach((p) => flat.push(p.x, p.y));
    const seg = MotionPathPlugin.pointsToSegment(flat, CURVINESS);

    // 24 samples per cubic plus a small margin: at 12 the curve could still
    // dip a few px past the zone between two sample points.
    let worst = 0;
    for (let i = 0; i + 7 < seg.length; i += 6) {
      for (let s = 0; s <= 24; s += 1) {
        const at = cubicAt(seg, i, s / 24);
        if (Math.abs(at.x) >= bandX) continue;
        const bite = (up ? at.y - inner : inner - at.y) + 6;
        if (bite > worst) worst = bite;
      }
    }

    if (worst <= 0.5) break;
    const push = worst + 14;
    points.forEach((p, i) => {
      if (!weight[i]) return;
      p.y += (up ? -push : push) * weight[i];
    });
  }

  return points;
}

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

      // Videos are gated on the timeline, not on a clock: a card only plays
      // while it is actually on screen, and nothing downloads before then.
      const videoCards = cards
        .map((card) => ({ card, video: card.querySelector<HTMLVideoElement>("video") }))
        .filter((entry): entry is { card: HTMLElement; video: HTMLVideoElement } => !!entry.video);
      const playing = new Map<HTMLVideoElement, boolean>();
      const loaded = new Set<HTMLVideoElement>();
      const syncVideos = (active: boolean) => {
        videoCards.forEach(({ card, video }) => {
          const on = active && (gsap.getProperty(card, "opacity") as number) > 0.05;
          if (playing.get(video) === on) return;
          playing.set(video, on);
          if (on) {
            if (!loaded.has(video)) {
              loaded.add(video);
              video.load();
            }
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      };

      mediaContext = gsap.matchMedia();

      mediaContext.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          // The mobile set is the subset that declares a mobile schedule; the
          // rest are display:none there and never get a trajectory.
          const drifting = cards.filter((card) => {
            const spec = cardById.get(card.dataset.card ?? "");
            return spec ? !isMobile || spec.atM !== undefined : false;
          });
          const timeOf = (spec: CreateCard) => (isMobile ? (spec.atM ?? spec.at) : spec.at);
          const spanOf = (spec: CreateCard) => (isMobile ? (spec.durM ?? spec.dur) : spec.dur);

          // ---- geometry, rebuilt from clean layout rects on every refresh ---
          // MotionPathPlugin reads `path` by reference and does not resolve
          // function-based values, so each card keeps ONE array for the whole
          // scene and measure() rewrites its contents in place. Paired with
          // invalidateOnRefresh, that is what makes the arcs re-derive on
          // resize instead of freezing at first-paint geometry.
          const paths = new Map<HTMLElement, Pt[]>();
          drifting.forEach((card) => {
            const spec = cardById.get(card.dataset.card ?? "");
            if (!spec) return;
            paths.set(
              card,
              driftPaths[spec.path].map(() => ({ x: 0, y: 0 })),
            );
          });

          let cX0 = 0;
          let cX1 = 0;
          let cX2 = 0;
          let miniX = 0;
          let miniY = 0;
          let miniScale = 0.1;

          const measure = () => {
            // Zero the transform channels GSAP owns so the reads below are
            // clean. Hidden states (autoAlpha) are deliberately left untouched.
            gsap.set(aInner, { scale: 1, y: 0 });
            gsap.set(cards, { rotation: 0, scale: 1, x: 0, xPercent: -50, y: 0, yPercent: -50 });
            gsap.set(closingLine, { x: 0 });
            gsap.set(formWrap, { scale: 1, x: 0, y: 0 });

            const stageR = stage.getBoundingClientRect();
            const halfW = stageR.width / 2;
            const halfH = stageR.height / 2;
            const stageCX = stageR.left + halfW;

            // The protected zone: the live answer rect plus generous breathing
            // room. Everything orbital is built outside of it.
            const answerR = aInner.getBoundingClientRect();
            const zoneHalfW = answerR.width / 2 + stageR.width * 0.06;
            const zoneHalfH = answerR.height / 2 + stageR.height * 0.06;
            const vScale = isMobile ? 0.9 : 1;
            const bleed = halfH * 0.06;

            drifting.forEach((card) => {
              const spec = cardById.get(card.dataset.card ?? "");
              const store = paths.get(card);
              if (!spec || !store) return;
              const w2 = card.offsetWidth / 2;
              const h2 = card.offsetHeight / 2;
              if (!w2 || !h2) return;
              // Solve against the card's real rendered envelope, not its
              // layout box: a tilted rectangle's axis-aligned bounds are
              // larger, and the scale breath adds a little more. Without this
              // a tilted card clips the zone at a corner.
              const rad = (Math.abs(spec.tilt) * Math.PI) / 180;
              const sin = Math.sin(rad);
              const cos = Math.cos(rad);
              const cw = SCALE_MID * (w2 * cos + h2 * sin);
              const ch = SCALE_MID * (w2 * sin + h2 * cos);

              const raw = driftPaths[spec.path];
              // Scale the arc horizontally so BOTH ends sit fully off-stage
              // whatever the card's width — the entry on the right and the exit
              // on the left are then clipped by the stage edge, never faded in
              // mid-air. The arcs are asymmetric, so the reference is the
              // SHORTER side; the longer one simply overshoots, which is free.
              const need = halfW + cw + 12;
              const reach = Math.min(
                Math.max(...raw.map(([u]) => u)),
                Math.abs(Math.min(...raw.map(([u]) => u))),
              );
              const xScale = need / ((reach || 1) * halfW);
              const points: Pt[] = raw.map(([u, v]) => ({
                x: u * halfW * xScale,
                y: v * halfH * vScale,
              }));

              // Crest sign, not entry sign: these arcs come in near
              // mid-height and only then bend up or down.
              const up = Math.min(...raw.map(([, v]) => v)) < -Math.max(...raw.map(([, v]) => v));
              solveClearance(points, {
                bandX: zoneHalfW + cw,
                inner: up ? -(zoneHalfH + ch) : zoneHalfH + ch,
                outer: up ? -(halfH + bleed - ch) : halfH + bleed - ch,
                up,
              });

              // Write through, never replace: the tween holds this reference.
              points.forEach((p, i) => {
                store[i].x = p.x;
                store[i].y = p.y;
              });
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

          // Fill the path arrays before any tween is built, so the plugin can
          // never cache a degenerate zero-length arc on its first init.
          measure();

          // Pre-reveal states. measure() never resets autoAlpha, so these
          // survive every refresh.
          gsap.set(qInner, { autoAlpha: 0, y: "0.45em" });
          gsap.set(aInner, { autoAlpha: 0, y: "0.5em" });
          gsap.set(cards, { autoAlpha: 0, transformOrigin: "50% 50%", xPercent: -50, yPercent: -50 });
          // Overscan so the internal crop drift never exposes a container edge.
          gsap.set("[data-card-media]", { scale: 1.08, transformOrigin: "50% 50%" });
          gsap.set(phrases, { autoAlpha: 0, rotation: 1.4, yPercent: 60 });
          gsap.set(formWrap, { autoAlpha: 0, transformOrigin: "50% 50%" });

          let interactiveAt = Infinity;

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=1000%" : "+=1380%",
              invalidateOnRefresh: true,
              onRefreshInit: measure,
              onToggle: (self) => syncVideos(self.isActive),
              onUpdate: (self) => {
                setInteractive(tl.time() >= interactiveAt);
                syncVideos(self.isActive);
              },
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
          // From here the answer does not move, scale or re-typeset. It is the
          // fixed gravitational centre the whole gallery orbits.

          // ---- 3. the drifting gallery ------------------------------------
          // One coordinated scene: every item is a sub-timeline on the master,
          // entering beyond the right edge, bending through its curated arch
          // around the protected zone, and leaving beyond the left. Nothing
          // lands, nothing reverses, and no item gets its own ScrollTrigger.
          const tiltScale = isMobile ? 0.6 : 1;

          drifting.forEach((card) => {
            const spec = cardById.get(card.dataset.card ?? "");
            if (!spec) return;
            const media = card.querySelector<HTMLElement>("[data-card-media]");
            const dur = spanOf(spec);
            const tilt = spec.tilt * tiltScale;

            const sub = gsap.timeline();

            sub.to(
              card,
              {
                duration: dur,
                ease: "none",
                motionPath: {
                  autoRotate: false,
                  curviness: CURVINESS,
                  // The full arc is authored, so GSAP must not prepend the
                  // element's current position (MotionPathPlugin `fromCurrent`).
                  fromCurrent: false,
                  path: paths.get(card),
                },
              },
              0,
            );

            // Opacity is only an edge softener — the arcs already start and end
            // off-stage, so these windows are short and the card is essentially
            // solid for its whole visible life.
            sub.fromTo(
              card,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: dur * 0.05,
                ease: "sine.out",
                immediateRender: false,
              },
              0,
            );

            sub
              .to(card, { autoAlpha: 0, duration: dur * 0.05, ease: "sine.in" }, dur * 0.95)
              // Barely-there breath, well inside the reference's 0.96–1.02.
              .fromTo(
                card,
                { scale: SCALE_IN },
                { duration: dur * 0.5, ease: "sine.inOut", immediateRender: false, scale: SCALE_MID },
                0,
              )
              .to(card, { duration: dur * 0.5, ease: "sine.inOut", scale: SCALE_OUT }, dur * 0.5)
              // A fixed base tilt that eases toward upright across the crossing
              // — so the tilt never exceeds the value authored in data.ts. The
              // card never rotates to follow the curve.
              .fromTo(
                card,
                { rotation: tilt },
                { duration: dur, ease: "sine.inOut", immediateRender: false, rotation: tilt * 0.35 },
                0,
              );

            // A whisper of internal crop drift, an order of magnitude smaller
            // than the travel: the picture lives inside the moving frame.
            if (media) {
              const axis = spec.crop === "y" ? "yPercent" : "xPercent";
              sub.fromTo(
                media,
                { [axis]: 2.5 },
                { duration: dur, ease: "none", immediateRender: false, [axis]: -2.5 },
                0,
              );
            }

            tl.add(sub, timeOf(spec));
          });

          // ---- 4. the stage clears, the sentence holds alone, then yields ---
          // The stream finishes on its own terms — a clean centred headline
          // beat — and the closing line grows straight out of that emptiness.
          // Nothing is held back to "close" the gallery with a final image.
          const s = isMobile ? 0.62 : 1;
          const cleared = STREAM_END * s;
          const release = cleared + 2.5 * s;

          tl.addLabel("cleared", cleared).to(
            aInner,
            { autoAlpha: 0, duration: 1.4 * s, ease: "sine.inOut" },
            release,
          );

          // ---- 5. the closing line writes itself in, then becomes the form --
          const gap = 1.8 * s;
          const l0 = release + 1.8 * s;
          const l1 = l0 + gap;
          const l2 = l1 + gap;
          const miniIn = l2 + 1.4 * s;
          const morphAt = miniIn + 1.8 * s;

          tl.addLabel("closing", l0)
            .set(closingLine, { x: () => cX0 }, "closing")
            .to(p0, { autoAlpha: 1, duration: 0.85 * s, ease: "sine.out", rotation: 0, yPercent: 0 }, "closing");

          tl.addLabel("soooo", l1)
            .to(closingLine, { duration: 0.9 * s, ease: "sine.inOut", x: () => cX1 }, "soooo")
            .to(p1, { autoAlpha: 1, duration: 0.85 * s, ease: "sine.out", rotation: 0, yPercent: 0 }, "soooo+=0.15");

          tl.addLabel("connect", l2)
            .to(closingLine, { duration: 0.9 * s, ease: "sine.inOut", x: () => cX2 }, "connect")
            .to(p2, { autoAlpha: 1, duration: 0.85 * s, ease: "sine.out", rotation: 0, yPercent: 0 }, "connect+=0.15");

          // The miniature form grows out of the slot at the end of the line,
          // then opens into the real one.
          tl.addLabel("mini", miniIn).fromTo(
            formWrap,
            { autoAlpha: 0, scale: () => miniScale, x: () => miniX, y: () => miniY },
            {
              autoAlpha: 1,
              duration: 0.9 * s,
              ease: "sine.out",
              immediateRender: false,
              scale: () => miniScale,
              x: () => miniX,
              y: () => miniY,
            },
            "mini",
          );

          tl.addLabel("morph", morphAt)
            .to(formWrap, { duration: 2 * s, ease: "sine.inOut", scale: 1, x: 0, y: 0 }, "morph")
            .to(closingLine, { autoAlpha: 0, duration: 1 * s, ease: "sine.in", yPercent: -12 }, "morph+=0.5");

          interactiveAt = morphAt + 2 * s + 2;

          // Settled hold; the footer rises over the last stretch of this.
          tl.to({}, { duration: 7 * s });
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
              className={`elc-create-card is-${card.id}`}
              data-card={card.id}
              data-layer={card.layer}
              key={card.id}
            >
              <span className="elc-create-card-media" data-card-media>
                {card.videoMp4Src ? (
                  <video loop muted playsInline poster={card.posterSrc} preload="none">
                    <source src={card.videoWebmSrc} type="video/webm" />
                    <source src={card.videoMp4Src} type="video/mp4" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={card.src} style={{ objectPosition: card.objectPosition }} />
                )}
              </span>
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
