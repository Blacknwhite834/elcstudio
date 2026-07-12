"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import ContactForm from "../contact-form";

export default function ContactScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stage = root.querySelector<HTMLElement>("[data-contact-stage]");
      const formWrap = root.querySelector<HTMLElement>("[data-contact-form-wrap]");
      if (!stage || !formWrap) return;

      // A soft, non-scrubbed reveal keeps the form immediately interactive.
      gsap.from(formWrap, {
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          start: "top 72%",
          toggleActions: "play none none reverse",
          trigger: stage,
        },
        y: 44,
      });

      // Pin the stage (without spacing) so the footer that follows rises
      // from the bottom and takes over the viewport.
      ScrollTrigger.create({
        anticipatePin: 1,
        end: "+=90%",
        invalidateOnRefresh: true,
        pin: stage,
        pinSpacing: false,
        start: "top top",
        trigger: stage,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="contact-title" className="elc-contact" id="contact" ref={rootRef}>
      <div className="elc-contact-stage" data-contact-stage>
        <h2 className="elc-sr-only" id="contact-title">
          Contact
        </h2>
        <div className="elc-contact-form-wrap" data-contact-form-wrap>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
