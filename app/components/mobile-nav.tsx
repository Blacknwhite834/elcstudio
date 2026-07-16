"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import RollingText from "./rolling-text";

// Mobile-only hero navigation. Matches Figma nodes 110:9 (closed capsule) and
// 111:201 (open glass panel). The desktop three-capsule nav is hidden below
// 768px (see .elc-nav in globals.css) and this component takes its place.
//
// React holds only the binary open/closed flag + ARIA; a single paused,
// reversible GSAP timeline owns every frame of the morph/reveal so fast taps
// just reverse from the current progress instead of stacking tweens.

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Method", href: "#method" },
  { label: "Subscriptions", href: "#subscriptions" },
  { label: "Contact", href: "#contact" },
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Build the open/close timeline once, scoped to the component. matchMedia
  // gives us a full-motion timeline and a reduced-motion fallback that keeps
  // the exact same closed/open layouts with minimal movement.
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    // Closed by default: out of the a11y/tab tree until opened.
    panel.setAttribute("inert", "");

    const ctx = gsap.context(() => {
      const dotL = root.querySelector<HTMLElement>('[data-dot="l"]');
      const dotM = root.querySelector<HTMLElement>('[data-dot="m"]');
      const dotR = root.querySelector<HTMLElement>('[data-dot="r"]');
      const label = root.querySelector<HTMLElement>("[data-mnav-label]");
      const risers = gsap.utils.toArray<HTMLElement>("[data-mnav-rise]", root);

      const showPanel = () => {
        gsap.set(panel, { visibility: "visible" });
        panel.removeAttribute("inert");
      };
      const hidePanel = () => {
        gsap.set(panel, { visibility: "hidden" });
        panel.setAttribute("inert", "");
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Closed initial state.
        gsap.set([dotL, dotM, dotR], { x: 0, y: 0 });
        gsap.set(panel, {
          clipPath: "inset(0 0 100% 0 round 25px)",
          opacity: 1,
        });
        gsap.set(risers, { yPercent: 100 });
        gsap.set(label, { autoAlpha: 0, y: 8 });

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.inOut" },
          onStart: showPanel,
          onReverseComplete: hidePanel,
        });

        tl
          // Dots tighten (center gap 8px -> 4px) and the mid dot lifts into the
          // caret — the same three elements move, Figma 111:206/207/208.
          .to(dotL, { x: 4, y: 2, duration: 0.5 }, 0)
          .to(dotM, { x: 0, y: -3, duration: 0.5 }, 0)
          .to(dotR, { x: -4, y: 2, duration: 0.5 }, 0)
          // Panel shell reveals top-origin, downward, corners emerging.
          .to(
            panel,
            {
              clipPath: "inset(0 0 0% 0 round 25px)",
              duration: 0.5,
              ease: "power3.inOut",
            },
            0.02,
          )
          .to(label, { autoAlpha: 1, y: 0, duration: 0.34 }, 0.14)
          // Links roll up through their masks with a restrained stagger.
          .to(
            risers,
            { yPercent: 0, duration: 0.44, ease: "power3.out", stagger: 0.06 },
            0.18,
          );

        timelineRef.current = tl;
        return () => {
          timelineRef.current = null;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([dotL, dotR], { x: 0, y: 0 });
        gsap.set(dotM, { x: 0, y: 0 });
        gsap.set(panel, {
          clipPath: "inset(0 0 0% 0 round 25px)",
          opacity: 0,
        });
        gsap.set(risers, { yPercent: 0 });
        gsap.set(label, { autoAlpha: 0, y: 0 });

        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 0.2, ease: "none" },
          onStart: showPanel,
          onReverseComplete: hidePanel,
        });

        tl
          .to(dotL, { x: 4, y: 2 }, 0)
          .to(dotM, { y: -3 }, 0)
          .to(dotR, { x: -4, y: 2 }, 0)
          .to(panel, { opacity: 1 }, 0)
          .to(label, { autoAlpha: 1 }, 0);

        timelineRef.current = tl;
        return () => {
          timelineRef.current = null;
        };
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Drive the timeline from state. Reversing a timeline parked at time 0 is a
  // no-op, so the initial closed render stays put.
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (open) tl.play();
    else tl.reverse();
  }, [open]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => buttonRef.current?.focus());
    }
  }, []);

  // Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    const closeAtDesktopBreakpoint = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    window.addEventListener("resize", closeAtDesktopBreakpoint);
    return () => window.removeEventListener("resize", closeAtDesktopBreakpoint);
  }, []);

  return (
    <div className="elc-mnav" ref={rootRef} data-mobile-nav>
      <div className="elc-mnav-bar">
        <a
          className="elc-mnav-brand"
          href="#top"
          aria-label="Back to top"
          onClick={() => close(false)}
        >
          <span className="elc-mnav-brand-art" aria-hidden="true">
            <Image
              className="elc-mnav-brand-base"
              src="/images/elc-studio-mark.svg"
              alt=""
              width="100"
              height="16"
              priority
              unoptimized
            />
            <Image
              className="elc-mnav-brand-accent"
              src="/images/elc-studio-mark.svg"
              alt=""
              width="100"
              height="16"
              priority
              unoptimized
            />
          </span>
        </a>
        <button
          type="button"
          className="elc-mnav-toggle"
          ref={buttonRef}
          aria-expanded={open}
          aria-controls="elc-mnav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="elc-mnav-dot" data-dot="l" />
          <span className="elc-mnav-dot elc-mnav-dot--accent" data-dot="m" />
          <span className="elc-mnav-dot" data-dot="r" />
        </button>
      </div>

      <div
        className="elc-mnav-panel"
        id="elc-mnav-panel"
        aria-hidden={!open}
        inert={!open}
        ref={panelRef}
      >
        <div className="elc-mnav-label-mask">
          <p className="elc-mnav-label" aria-hidden="true" data-mnav-label>
            Pages
          </p>
        </div>
        <nav className="elc-mnav-links" aria-label="Pages">
          {LINKS.map((link) => (
            <a
              key={link.href}
              className="elc-mnav-link"
              href={link.href}
              onClick={() => close(false)}
            >
              <span className="elc-mnav-mask">
                <span className="elc-mnav-rise" data-mnav-rise>
                  <RollingText>{link.label}</RollingText>
                </span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
