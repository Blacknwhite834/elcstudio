"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function ClosingScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-closing-stage]");
      const line = root.querySelector<HTMLElement>("[data-closing-line]");
      const phrases = gsap.utils.toArray<HTMLElement>("[data-closing-phrase]", root);
      const chip = root.querySelector<HTMLElement>("[data-closing-chip]");
      if (!stage || !line || phrases.length === 0 || !chip) return;

      // Shift so the currently visible prefix of the line reads centered,
      // exactly like the accumulating states in Figma (95:30 → 97:36).
      const prefixShift = (count: number) => () => {
        const lineWidth = line.offsetWidth;
        let visible = 0;
        for (let index = 0; index < count && index < phrases.length; index += 1) {
          visible = phrases[index].offsetLeft + phrases[index].offsetWidth;
        }
        return (lineWidth - visible) / 2;
      };

      gsap.set(phrases, { autoAlpha: 0, rotation: 1.6, yPercent: 65 });
      gsap.set(chip, {
        autoAlpha: 0,
        rotation: -14,
        skewY: 7,
        transformOrigin: "12% 88%",
        yPercent: 30,
      });

      // No pin: the sentence assembles on a short scrubbed approach so the
      // form below is already sharing the viewport when it completes.
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          end: "center 40%",
          invalidateOnRefresh: true,
          scrub: 0.85,
          start: "top 60%",
          trigger: stage,
        },
      });

      tl.to(phrases[0], { autoAlpha: 1, duration: 0.45, rotation: 0, yPercent: 0 }, 0);

      // "Soooo...." continues the sentence rather than starting a section.
      // fromTo keeps the font-dependent offset fresh across refreshes.
      tl.addLabel("soooo", 0.55)
        .fromTo(
          line,
          { x: prefixShift(1) },
          { duration: 0.5, ease: "power1.inOut", x: prefixShift(2) },
          "soooo",
        )
        .to(
          phrases[1],
          { autoAlpha: 1, duration: 0.45, rotation: 0, yPercent: 0 },
          "soooo+=0.1",
        );

      // Sticker-peel arrival for the connect chip — distinct from the
      // pricing chip's masked scale-in.
      tl.addLabel("connect", 1.2)
        .to(line, { duration: 0.55, ease: "power1.inOut", x: 0 }, "connect")
        .to(
          phrases[2],
          { autoAlpha: 1, duration: 0.5, rotation: 0, yPercent: 0 },
          "connect+=0.12",
        )
        .to(
          chip,
          {
            autoAlpha: 1,
            duration: 0.55,
            ease: "power3.out",
            rotation: 0,
            skewY: 0,
            yPercent: 0,
          },
          "connect+=0.3",
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="elc-closing" ref={rootRef}>
      <div className="elc-closing-stage" data-closing-stage>
        <h2 className="elc-closing-heading">
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
            </span>{" "}
            <span className="elc-chip" data-closing-chip />
          </span>
        </h2>
      </div>
    </section>
  );
}
