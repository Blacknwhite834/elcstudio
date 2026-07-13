"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ContactForm from "../contact-form";

// Playhead time at which the morph completes and the form becomes usable.
const INTERACTIVE_AT = 5.05;

export default function ConnectScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-connect-stage]");
      const line = root.querySelector<HTMLElement>("[data-closing-line]");
      const phrases = gsap.utils.toArray<HTMLElement>("[data-closing-phrase]", root);
      const slot = root.querySelector<HTMLElement>("[data-form-slot]");
      const formWrap = root.querySelector<HTMLElement>("[data-form-wrap]");
      if (!stage || !line || phrases.length < 3 || !slot || !formWrap) return;

      const [p0, p1, p2] = phrases;

      // FLIP geometry from clean layout rects (transforms reset first).
      let x0 = 0;
      let x1 = 0;
      let x2 = 0;
      let miniX = 0;
      let miniY = 0;
      let miniScale = 0.1;
      const measure = () => {
        gsap.set(line, { x: 0 });
        gsap.set(formWrap, { scale: 1, x: 0, y: 0 });
        const stageR = stage.getBoundingClientRect();
        const p0R = p0.getBoundingClientRect();
        const p1R = p1.getBoundingClientRect();
        const p2R = p2.getBoundingClientRect();
        const slotR = slot.getBoundingClientRect();
        const wrapR = formWrap.getBoundingClientRect();
        const stageCenter = stageR.left + stageR.width / 2;
        x0 = stageCenter - (p0R.left + p0R.right) / 2;
        x1 = stageCenter - (p0R.left + p1R.right) / 2;
        x2 = stageCenter - (p0R.left + p2R.right) / 2;
        // Min-fit keeps the mini undistorted on every viewport.
        miniScale = Math.min(slotR.width / wrapR.width, slotR.height / wrapR.height);
        miniX = slotR.left + slotR.width / 2 + x2 - (wrapR.left + wrapR.width / 2);
        miniY = slotR.top + slotR.height / 2 - (wrapR.top + wrapR.height / 2);
      };

      // Interactivity is derived deterministically from timeline time, so it
      // reverses cleanly and never blocks the form after the morph. Start
      // disabled (null forces the first toggle to apply).
      let interactive: boolean | null = null;
      const setInteractive = (on: boolean) => {
        if (on === interactive) return;
        interactive = on;
        formWrap.style.pointerEvents = on ? "auto" : "none";
        if (on) formWrap.removeAttribute("inert");
        else formWrap.setAttribute("inert", "");
      };
      setInteractive(false);

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          gsap.set(phrases, { autoAlpha: 0, rotation: 1.4, yPercent: 60 });
          gsap.set(formWrap, { autoAlpha: 0, transformOrigin: "50% 50%" });

          // Pin long enough that the morph completes and the form holds
          // centered before the footer (pulled up 100svh) rises over it.
          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              anticipatePin: 1,
              end: isMobile ? "+=460%" : "+=600%",
              invalidateOnRefresh: true,
              onRefreshInit: measure,
              onUpdate: () => setInteractive(tl.time() >= INTERACTIVE_AT),
              pin: true,
              scrub: 0.9,
              start: "top top",
              trigger: stage,
            },
          });

          // ---- slow closing sentence with holds ---------------------------
          tl.fromTo(line, { x: () => x0 }, { duration: 0.01, x: () => x0 }, 0).to(
            p0,
            { autoAlpha: 1, duration: 0.5, rotation: 0, yPercent: 0 },
            0,
          );
          tl.addLabel("soooo", 0.9)
            .to(line, { duration: 0.5, ease: "power1.inOut", x: () => x1 }, "soooo")
            .to(p1, { autoAlpha: 1, duration: 0.5, rotation: 0, yPercent: 0 }, "soooo+=0.1");
          tl.addLabel("connect", 1.9)
            .to(line, { duration: 0.5, ease: "power1.inOut", x: () => x2 }, "connect")
            .to(p2, { autoAlpha: 1, duration: 0.5, rotation: 0, yPercent: 0 }, "connect+=0.1");

          // ---- mini: the real form container pops in at the slot ----------
          tl.addLabel("mini", 2.9).fromTo(
            formWrap,
            { autoAlpha: 0, scale: () => miniScale * 0.9, x: () => miniX, y: () => miniY },
            {
              autoAlpha: 1,
              duration: 0.45,
              ease: "power2.out",
              scale: () => miniScale,
              x: () => miniX,
              y: () => miniY,
            },
            "mini",
          );

          // ---- morph: softer, inviting expansion to the centered form -----
          // The whole form (shell + input + CTA + dots) scales as one unit,
          // so the miniature already reads as a small form.
          tl.addLabel("morph", 3.7)
            .to(formWrap, { duration: 1.35, ease: "power1.inOut", scale: 1, x: 0, y: 0 }, "morph")
            .to(line, { autoAlpha: 0, duration: 0.6, ease: "power1.in", yPercent: -12 }, "morph+=0.3");

          // Settled hold; the footer rises over the last stretch of this.
          tl.to({}, { duration: 1.5 });
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="connect-title" className="elc-connect" id="contact" ref={rootRef}>
      <h2 className="elc-sr-only" id="connect-title">
        Contact
      </h2>
      <div className="elc-connect-stage" data-connect-stage>
        <p className="elc-closing-heading">
          <span className="elc-sr-only">That’s all. Soooo.... Let’s connect</span>
          <span aria-hidden="true" className="elc-closing-line" data-closing-line>
            <span className="elc-closing-phrase" data-closing-phrase>
              That’s all.
            </span>{" "}
            <span className="elc-closing-phrase" data-closing-phrase>
              Soooo....
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
