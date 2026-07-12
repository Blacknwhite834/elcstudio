"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./lib/gsap";
import type { ProcessProgressDetail } from "./components/scenes/dark-scene";

type LenisInstance = {
  destroy: () => void;
  raf: (time: number) => void;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { duration?: number; immediate?: boolean; offset?: number },
  ) => void;
  on: (event: "scroll", callback: () => void) => void;
};

export default function Interactions() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    let isDestroyed = false;
    let lenis: LenisInstance | undefined;
    let ticker: ((time: number) => void) | undefined;

    document.documentElement.classList.add("elc-js");

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const scrollToTarget = (target: string | number | HTMLElement) => {
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.15 });
        return;
      }

      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: prefersReducedMotion ? "auto" : "smooth" });
        return;
      }

      if (typeof target === "string") {
        document.querySelector<HTMLElement>(target)?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        return;
      }

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    const anchorLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const onAnchorClick = (event: MouseEvent) => {
      const link = event.currentTarget as HTMLAnchorElement;
      const href = link.getAttribute("href");

      if (!href || href === "#") return;
      event.preventDefault();

      if (href === "#top") {
        scrollToTarget(0);
        return;
      }

      scrollToTarget(href);
    };

    anchorLinks.forEach((link) => link.addEventListener("click", onAnchorClick));
    cleanups.push(() => {
      anchorLinks.forEach((link) => link.removeEventListener("click", onAnchorClick));
    });

    const motionVideos = Array.from(
      document.querySelectorAll<HTMLVideoElement>("[data-motion-video]"),
    );

    motionVideos.forEach((video) => {
      video.pause();
    });

    if (!prefersReducedMotion && "IntersectionObserver" in window && motionVideos.length) {
      const primeVideo = (video: HTMLVideoElement) => {
        if (video.dataset.videoPrimed === "true") return;

        video.dataset.videoPrimed = "true";
        video.preload = "metadata";
        video.load();
      };

      const playVisibleVideo = (video: HTMLVideoElement) => {
        primeVideo(video);

        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => undefined);
        }
      };

      const motionVideoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;

            if (entry.isIntersecting) {
              primeVideo(video);
            }

            if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
              playVisibleVideo(video);
              return;
            }

            video.pause();
          });
        },
        {
          rootMargin: "35% 0px 35% 0px",
          threshold: [0, 0.2, 0.5],
        },
      );

      motionVideos.forEach((video) => motionVideoObserver.observe(video));
      cleanups.push(() => {
        motionVideoObserver.disconnect();
        motionVideos.forEach((video) => video.pause());
      });
    }

    if (!prefersReducedMotion) {
      import("lenis").then(({ default: Lenis }) => {
        if (isDestroyed) return;

        lenis = new Lenis({
          lerp: 0.09,
          smoothWheel: true,
          touchMultiplier: 1.08,
          wheelMultiplier: 0.82,
          autoRaf: false,
        }) as LenisInstance;

        ticker = (time: number) => {
          lenis?.raf(time * 1000);
        };

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);

        if (!window.location.hash) {
          lenis.scrollTo(0, { immediate: true });
        }
      });
    }

    if (prefersReducedMotion) {
      document.documentElement.classList.add("elc-reduced-motion");
      // No animation path runs, so the preloader must be dismissed here.
      document.querySelector<HTMLElement>("[data-preloader]")?.style.setProperty("display", "none");
      return () => {
        isDestroyed = true;
        cleanups.forEach((cleanup) => cleanup());
        document.documentElement.classList.remove("elc-js", "elc-reduced-motion");
        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }
      };
    }

    const ctx = gsap.context(() => {
      const nav = document.querySelector<HTMLElement>("[data-elc-nav]");
      const methodIndicator = document.querySelector<HTMLElement>("[data-method-indicator]");
      const methodDots = gsap.utils.toArray<HTMLElement>("[data-method-dot]");
      const hero = document.querySelector<HTMLElement>("[data-hero-section]");
      const heroPhone = document.querySelector<HTMLElement>("[data-hero-phone]");
      const heroLogo = document.querySelector<HTMLElement>("[data-hero-logo]");
      const heroPhoneInner = document.querySelector<HTMLElement>("[data-hero-phone-inner]");
      type NavMode = "default" | "card";
      let setNavMode: (mode: NavMode, animate?: boolean) => void = () => undefined;

      const cursor = document.querySelector<HTMLElement>("[data-cursor]");
      if (cursor) {
        gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        const cursorXTo = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3" });
        const cursorYTo = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3" });
        const onCursorMove = (e: MouseEvent) => {
          cursorXTo(e.clientX);
          cursorYTo(e.clientY);
        };
        const onFirstMove = (e: MouseEvent) => {
          gsap.to(cursor, { autoAlpha: 1, duration: 0.26, ease: "power2.out" });
          cursorXTo(e.clientX);
          cursorYTo(e.clientY);
          window.removeEventListener("mousemove", onFirstMove);
          window.addEventListener("mousemove", onCursorMove);
        };
        window.addEventListener("mousemove", onFirstMove);
        const interactiveEls = document.querySelectorAll<Element>("a, button, input, textarea, select");
        const textEls = Array.from(
          document.querySelectorAll<Element>("h1, h2, h3, p, li, strong"),
        ).filter(
          (el) =>
            !el.closest(
              "a, button, input, textarea, select, label, [contenteditable='true']",
            ),
        );
        const addHover = () => {
          cursor.classList.remove("is-text");
          cursor.classList.add("is-link");
        };
        const removeHover = () => cursor.classList.remove("is-link");
        const addTextHover = () => {
          if (cursor.classList.contains("is-link")) return;
          cursor.classList.add("is-text");
        };
        const removeTextHover = () => cursor.classList.remove("is-text");
        interactiveEls.forEach((el) => {
          el.addEventListener("mouseenter", addHover);
          el.addEventListener("mouseleave", removeHover);
        });
        textEls.forEach((el) => {
          el.addEventListener("mouseenter", addTextHover);
          el.addEventListener("mouseleave", removeTextHover);
        });
        cleanups.push(() => {
          window.removeEventListener("mousemove", onFirstMove);
          window.removeEventListener("mousemove", onCursorMove);
          interactiveEls.forEach((el) => {
            el.removeEventListener("mouseenter", addHover);
            el.removeEventListener("mouseleave", removeHover);
          });
          textEls.forEach((el) => {
            el.removeEventListener("mouseenter", addTextHover);
            el.removeEventListener("mouseleave", removeTextHover);
          });
        });
      }

      if (nav) {
        let navMode: NavMode = "default";

        setNavMode = (mode: NavMode, animate = true) => {
          if (mode === navMode && animate) return;
          navMode = mode;

          gsap.killTweensOf(nav);
          if (methodIndicator) gsap.killTweensOf(methodIndicator);

          const applyMode = () => {
            nav.classList.toggle("is-card-nav", mode === "card");
            gsap.set(nav, { pointerEvents: "auto" });
            if (methodIndicator) {
              gsap.set(methodIndicator, { autoAlpha: mode === "card" ? 1 : 0, y: 0 });
            }
          };

          if (!animate) {
            applyMode();
            gsap.set(nav, { autoAlpha: 1, filter: "blur(0px)", y: 0 });
            return;
          }

          gsap.to(nav, {
            autoAlpha: 0,
            duration: 0.18,
            ease: "power2.out",
            filter: "blur(10px)",
            onComplete: () => {
              applyMode();
              gsap.to(nav, {
                autoAlpha: 1,
                duration: 0.42,
                ease: "power3.out",
                filter: "blur(0px)",
                y: 0,
              });
            },
            y: -18,
          });
        };

        nav.classList.remove("is-card-nav");
        gsap.set(nav, { autoAlpha: 0, filter: "blur(16px)", pointerEvents: "none", y: -32 });
        if (methodIndicator) {
          gsap.set(methodIndicator, { autoAlpha: 0, y: 0 });
        }
      }

      // The dark scene broadcasts the horizontal process progress; the nav
      // indicator mirrors it, exactly like the old method section did.
      if (methodDots.length) {
        let activeMethodDot = -1;

        const setActiveMethodDot = (nextIndex: number) => {
          if (nextIndex === activeMethodDot) return;

          activeMethodDot = nextIndex;
          const isMobile = window.matchMedia("(max-width: 767px)").matches;

          methodDots.forEach((dot, dotIndex) => {
            gsap.to(dot, {
              backgroundColor: dotIndex === nextIndex ? "#050505" : "rgba(172, 160, 164, 0.38)",
              duration: 0.34,
              ease: "power3.out",
              opacity: dotIndex === nextIndex ? 1 : 0.62,
              scale: dotIndex === nextIndex ? 1 : 0.94,
              width: dotIndex === nextIndex ? (isMobile ? 40 : 54) : isMobile ? 7 : 9,
            });
          });
        };

        gsap.set(methodDots, {
          backgroundColor: "rgba(172, 160, 164, 0.38)",
          opacity: 0.62,
          scale: 0.94,
          width: 9,
        });
        setActiveMethodDot(0);

        const onProcessProgress = (event: Event) => {
          const { active, progress } = (event as CustomEvent<ProcessProgressDetail>).detail;
          setNavMode(active ? "card" : "default");
          if (active) {
            const maxIndex = methodDots.length - 1;
            setActiveMethodDot(Math.min(maxIndex, Math.round(progress * maxIndex)));
          } else {
            setActiveMethodDot(0);
          }
        };

        window.addEventListener("elc:process", onProcessProgress);
        cleanups.push(() => window.removeEventListener("elc:process", onProcessProgress));
      }

      const startEntryAnimation = () => {
        if (!heroPhone || !heroLogo) return;

        gsap.set(heroPhone, {
          autoAlpha: 0,
          filter: "blur(36px)",
          rotation: -12,
          scale: 1.22,
          transformOrigin: "50% 18%",
          y: -96,
        });
        gsap.set(heroLogo, { autoAlpha: 0, filter: "blur(20px)", scale: 0.92, y: 220 });

        const introTl = gsap.timeline({ delay: 0.05 });

        introTl
          .to(heroPhone, {
            autoAlpha: 1,
            duration: 1.42,
            ease: "expo.out",
            filter: "blur(0px)",
            rotation: 0,
            scale: 1,
            y: 0,
          })
          .to(
            heroLogo,
            {
              autoAlpha: 1,
              duration: 1.16,
              ease: "power4.out",
              filter: "blur(0px)",
              scale: 1,
              y: 0,
            },
            "-=0.94",
          );

        if (nav) {
          introTl.to(
            nav,
            {
              autoAlpha: 1,
              duration: 0.74,
              ease: "power3.out",
              filter: "blur(0px)",
              pointerEvents: "auto",
              y: 0,
            },
            "-=0.58",
          );
        }
      };

      const isFirstVisit = !localStorage.getItem("elc-visited");
      if (isFirstVisit) localStorage.setItem("elc-visited", "1");

      const preloader = document.querySelector<HTMLElement>("[data-preloader]");
      const preloaderLogo = document.querySelector<HTMLElement>("[data-preloader-logo]");

      if (preloader && preloaderLogo && isFirstVisit) {
        gsap.set(preloaderLogo, { autoAlpha: 0, filter: "blur(36px)", scale: 1.2, y: -50 });

        gsap
          .timeline()
          .to(preloaderLogo, {
            autoAlpha: 1,
            duration: 1.08,
            ease: "expo.out",
            filter: "blur(0px)",
            scale: 1,
            y: 0,
          })
          .to({}, { duration: 0.38 })
          .to(preloaderLogo, {
            autoAlpha: 0,
            duration: 0.52,
            ease: "power2.in",
            filter: "blur(32px)",
            scale: 1.12,
          })
          .to(
            preloader,
            {
              duration: 0.86,
              ease: "expo.inOut",
              onStart: startEntryAnimation,
              yPercent: -100,
            },
            "-=0.22",
          )
          .set(preloader, { display: "none" });
      } else {
        if (preloader) gsap.set(preloader, { display: "none" });
        startEntryAnimation();
      }

      if (hero && heroPhone && heroLogo) {
        gsap
          .timeline({
            scrollTrigger: {
              anticipatePin: 1,
              end: "+=92%",
              pin: true,
              scrub: true,
              start: "center center",
              trigger: hero,
            },
          })
          .fromTo(
            heroPhone,
            {
              autoAlpha: 1,
              rotation: 0,
              scale: 1,
              y: 0,
              yPercent: 0,
            },
            {
              autoAlpha: 0,
              ease: "none",
              immediateRender: false,
              rotation: -7,
              scale: 0.74,
              yPercent: -20,
            },
            0,
          )
          .fromTo(
            heroLogo,
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              yPercent: 0,
            },
            {
              autoAlpha: 0,
              ease: "none",
              immediateRender: false,
              scale: 0.94,
              yPercent: 38,
            },
            0,
          );
      }

      if (heroPhoneInner) {
        const phoneXTo = gsap.quickTo(heroPhoneInner, "x", { duration: 1.6, ease: "power3" });
        const phoneYTo = gsap.quickTo(heroPhoneInner, "y", { duration: 1.6, ease: "power3" });
        const onParallax = (e: MouseEvent) => {
          const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
          const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
          phoneXTo(dx * 22);
          phoneYTo(dy * 14);
        };
        window.addEventListener("mousemove", onParallax);
        cleanups.push(() => window.removeEventListener("mousemove", onParallax));
      }
    });

    cleanups.push(() => ctx.revert());

    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", refresh);
    window.setTimeout(refresh, 250);
    document.fonts?.ready.then(() => {
      if (!isDestroyed) refresh();
    });
    cleanups.push(() => window.removeEventListener("load", refresh));

    return () => {
      isDestroyed = true;
      cleanups.forEach((cleanup) => cleanup());
      if (ticker) gsap.ticker.remove(ticker);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      document.documentElement.classList.remove("elc-js");
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  return null;
}
