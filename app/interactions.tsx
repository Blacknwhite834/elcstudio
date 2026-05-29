"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

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
    gsap.registerPlugin(ScrollTrigger, SplitText);

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
      document.querySelectorAll<HTMLVideoElement>("[data-method-video], [data-stack-video]"),
    );

    motionVideos.forEach((video) => {
      video.pause();
    });

    if (!prefersReducedMotion && "IntersectionObserver" in window && motionVideos.length) {
      const playVisibleVideo = (video: HTMLVideoElement) => {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => undefined);
        }
      };

      const motionVideoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
              playVisibleVideo(video);
              return;
            }

            video.pause();
          });
        },
        {
          rootMargin: "-14% -14% -14% -14%",
          threshold: [0, 0.28, 0.5],
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
        const addHover = () => cursor.classList.add("is-link");
        const removeHover = () => cursor.classList.remove("is-link");
        interactiveEls.forEach((el) => {
          el.addEventListener("mouseenter", addHover);
          el.addEventListener("mouseleave", removeHover);
        });
        cleanups.push(() => {
          window.removeEventListener("mousemove", onFirstMove);
          window.removeEventListener("mousemove", onCursorMove);
          interactiveEls.forEach((el) => {
            el.removeEventListener("mouseenter", addHover);
            el.removeEventListener("mouseleave", removeHover);
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

      const splitInstances: SplitText[] = [];
      const introSection = document.querySelector<HTMLElement>(".elc-intro");
      const introText = document.querySelector<HTMLElement>("[data-split-reveal]");

      if (introSection && introText) {
        const split = new SplitText(introText, {
          type: "words",
          wordsClass: "split-word",
        });

        splitInstances.push(split);
        gsap.set(split.words, { color: "#b6afb2" });

        gsap.timeline({
          scrollTrigger: {
            anticipatePin: 1,
            end: "+=118%",
            pin: true,
            scrub: true,
            start: "top top",
            trigger: introSection,
          },
        }).to(split.words, {
          color: "#050505",
          ease: "none",
          stagger: 0.06,
        });
      }

      const subscriptionsSection = document.querySelector<HTMLElement>(
        "[data-subscriptions-section]",
      );
      const stackHeading = document.querySelector<HTMLElement>("[data-stack-heading]");
      const createStackHeadingReveal = () => {
        if (!stackHeading || !subscriptionsSection) return;

        const split = new SplitText(stackHeading, {
          type: "words",
          wordsClass: "split-word",
        });
        const stackHeadingWords = split.words as HTMLElement[];

        splitInstances.push(split);
        gsap.set(stackHeadingWords, { color: "#b6afb2" });

        gsap.timeline({
          scrollTrigger: {
            end: "top 18%",
            scrub: true,
            start: "top 74%",
            trigger: subscriptionsSection,
          },
        }).to(stackHeadingWords, {
          color: "#050505",
          ease: "none",
          stagger: 0.06,
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const method = document.querySelector<HTMLElement>("[data-method-section]");
        const methodTrack = document.querySelector<HTMLElement>("[data-method-track]");
        const methodCards = gsap.utils.toArray<HTMLElement>("[data-method-card]");
        const methodTitle = document.querySelector<HTMLElement>("[data-method-title]");

        if (method && methodTrack) {
          const distance = () =>
            Math.max(
              0,
              methodTrack.scrollWidth - window.innerWidth + Math.min(window.innerWidth * 0.12, 220),
            );
          let activeMethodDot = -1;
          const setActiveMethodDot = (nextIndex: number) => {
            if (!methodDots.length || nextIndex === activeMethodDot) return;

            activeMethodDot = nextIndex;

            methodDots.forEach((dot, dotIndex) => {
              gsap.to(dot, {
                backgroundColor: dotIndex === nextIndex ? "#050505" : "rgba(172, 160, 164, 0.38)",
                duration: 0.34,
                ease: "power3.out",
                opacity: dotIndex === nextIndex ? 1 : 0.62,
                scale: dotIndex === nextIndex ? 1 : 0.94,
                width: dotIndex === nextIndex ? 54 : 9,
              });
            });
          };
          const showMethodIndicator = () => {
            setNavMode("card");
          };
          const hideMethodIndicator = () => {
            setNavMode("default");
          };

          if (methodDots.length) {
            gsap.set(methodDots, {
              backgroundColor: "rgba(172, 160, 164, 0.38)",
              opacity: 0.62,
              scale: 0.94,
              width: 9,
            });
            gsap.set(methodDots[0], {
              backgroundColor: "#050505",
              opacity: 1,
              scale: 1,
              width: 54,
            });
            activeMethodDot = 0;
          }

          gsap.from(methodTitle ? [methodTitle, ...methodCards] : methodCards, {
            autoAlpha: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              start: "top 72%",
              trigger: method,
            },
            y: 44,
          });

          gsap.to(methodTrack, {
            ease: "none",
            scrollTrigger: {
              anticipatePin: 1,
              end: () => `+=${Math.max(900, distance() + window.innerHeight * 0.62)}`,
              invalidateOnRefresh: true,
              onEnter: showMethodIndicator,
              onEnterBack: showMethodIndicator,
              onLeave: hideMethodIndicator,
              onLeaveBack: () => {
                setActiveMethodDot(0);
                hideMethodIndicator();
              },
              onUpdate: (self) => {
                const maxIndex = Math.max(0, Math.min(methodCards.length, methodDots.length) - 1);
                const nextIndex = Math.min(maxIndex, Math.round(self.progress * maxIndex));
                setActiveMethodDot(nextIndex);
              },
              pin: true,
              scrub: true,
              start: "top top",
              trigger: method,
            },
            x: () => -distance(),
          });
        }
      });

      mm.add("(max-width: 767px)", () => {
        const method = document.querySelector<HTMLElement>("[data-method-section]");
        const methodCards = gsap.utils.toArray<HTMLElement>("[data-method-card]");

        if (method && methodDots.length) {
          let activeMethodDot = -1;
          const setActiveMethodDot = (nextIndex: number) => {
            if (nextIndex === activeMethodDot) return;

            activeMethodDot = nextIndex;

            methodDots.forEach((dot, dotIndex) => {
              gsap.to(dot, {
                backgroundColor: dotIndex === nextIndex ? "#050505" : "rgba(172, 160, 164, 0.38)",
                duration: 0.28,
                ease: "power3.out",
                opacity: dotIndex === nextIndex ? 1 : 0.62,
                scale: dotIndex === nextIndex ? 1 : 0.94,
                width: dotIndex === nextIndex ? 40 : 7,
              });
            });
          };

          setActiveMethodDot(0);

          ScrollTrigger.create({
            end: "bottom 38%",
            onEnter: () => setNavMode("card"),
            onEnterBack: () => setNavMode("card"),
            onLeave: () => setNavMode("default"),
            onLeaveBack: () => {
              setActiveMethodDot(0);
              setNavMode("default");
            },
            onUpdate: (self) => {
              const maxIndex = Math.max(0, Math.min(methodCards.length, methodDots.length) - 1);
              const nextIndex = Math.min(maxIndex, Math.round(self.progress * maxIndex));
              setActiveMethodDot(nextIndex);
            },
            start: "top 64%",
            trigger: method,
          });
        }

        gsap.from("[data-method-title], [data-method-card]", {
          autoAlpha: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            start: "top 76%",
            trigger: "[data-method-section]",
          },
          y: 34,
        });
      });

      createStackHeadingReveal();
      const calmSection = document.querySelector<HTMLElement>("[data-calm-section]");
      const calmTitle = document.querySelector<HTMLElement>("[data-calm-title]");
      const calmSoft = document.querySelector<HTMLElement>("[data-calm-soft]");
      const calmStrong = document.querySelector<HTMLElement>("[data-calm-strong]");
      const calmCount = document.querySelector<HTMLElement>("[data-calm-count]");
      const calmCards = gsap.utils.toArray<HTMLElement>("[data-float-card]");

      mm.add("(min-width: 768px)", () => {
        const stack = document.querySelector<HTMLElement>("[data-stack]");
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");

        if (subscriptionsSection && stack && cards.length === 3) {
          let activeStackCard = -1;
          const setActiveStackCard = (nextIndex: number) => {
            if (nextIndex === activeStackCard) return;

            activeStackCard = nextIndex;
            cards.forEach((card, cardIndex) => {
              card.classList.toggle("is-stack-active", cardIndex === nextIndex);
            });
          };

          setActiveStackCard(0);

          const getStackLifts = () => {
            const styles = window.getComputedStyle(stack);
            const midLift =
              Number.parseFloat(styles.getPropertyValue("--elc-stack-lift-mid")) || 32;
            const backLift =
              Number.parseFloat(styles.getPropertyValue("--elc-stack-lift-back")) || 58;

            return {
              back: -backLift,
              mid: -midLift,
            };
          };

          const placeStack = () => {
            const { back, mid } = getStackLifts();

            gsap.set(cards[0], {
              autoAlpha: 1,
              force3D: true,
              scale: 1,
              transformOrigin: "50% 50%",
              y: 0,
              zIndex: 3,
            });
            gsap.set(cards[1], {
              autoAlpha: 1,
              force3D: true,
              scale: 0.986,
              transformOrigin: "50% 50%",
              y: mid,
              zIndex: 2,
            });
            gsap.set(cards[2], {
              autoAlpha: 1,
              force3D: true,
              scale: 0.972,
              transformOrigin: "50% 50%",
              y: back,
              zIndex: 1,
            });
          };

          placeStack();

          const stackTimeline = gsap.timeline({
            scrollTrigger: {
              anticipatePin: 1,
              end: "+=260%",
              invalidateOnRefresh: true,
              onRefreshInit: placeStack,
              pin: stack,
              pinSpacing: true,
              scrub: 1.15,
              start: "center center",
              trigger: stack,
            },
          });

          const firstTransitionStart = 0.42;
          const transitionDuration = 1.28;
          const activeSwitchOffset = transitionDuration * 0.58;
          const zIndexSwitchOffset = transitionDuration * 0.5;
          const firstActiveAt = firstTransitionStart + activeSwitchOffset;
          const secondTransitionStart = firstTransitionStart + transitionDuration + 0.24;
          const secondActiveAt = secondTransitionStart + activeSwitchOffset;

          stackTimeline.eventCallback("onUpdate", () => {
            const time = stackTimeline.time();
            const nextIndex = time < firstActiveAt ? 0 : time < secondActiveAt ? 1 : 2;
            setActiveStackCard(nextIndex);
          });

          stackTimeline
            .set(cards[0], { zIndex: 1 }, firstTransitionStart + zIndexSwitchOffset)
            .set(cards[1], { zIndex: 3 }, firstTransitionStart + zIndexSwitchOffset)
            .set(cards[2], { zIndex: 2 }, firstTransitionStart + zIndexSwitchOffset)
            .to(
              cards[0],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 0.972,
                y: () => getStackLifts().back,
              },
              firstTransitionStart,
            )
            .to(
              cards[1],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 1,
                y: 0,
              },
              firstTransitionStart,
            )
            .to(
              cards[2],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 0.986,
                y: () => getStackLifts().mid,
              },
              firstTransitionStart,
            )
            .set(cards[0], { zIndex: 1 }, firstActiveAt)
            .set(cards[1], { zIndex: 3 }, firstActiveAt)
            .set(cards[2], { zIndex: 2 }, firstActiveAt)
            .set(cards[0], { zIndex: 2 }, secondTransitionStart + zIndexSwitchOffset)
            .set(cards[1], { zIndex: 1 }, secondTransitionStart + zIndexSwitchOffset)
            .set(cards[2], { zIndex: 3 }, secondTransitionStart + zIndexSwitchOffset)
            .to(
              cards[1],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 0.972,
                y: () => getStackLifts().back,
              },
              secondTransitionStart,
            )
            .to(
              cards[2],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 1,
                y: 0,
              },
              secondTransitionStart,
            )
            .to(
              cards[0],
              {
                duration: transitionDuration,
                ease: "power2.inOut",
                force3D: true,
                scale: 0.986,
                y: () => getStackLifts().mid,
              },
              secondTransitionStart,
            )
            .set(cards[0], { zIndex: 2 }, secondActiveAt)
            .set(cards[1], { zIndex: 1 }, secondActiveAt)
            .set(cards[2], { zIndex: 3 }, secondActiveAt);
        }
      });

      mm.add("(max-width: 767px)", () => {
        gsap.from("[data-stack-card]", {
          autoAlpha: 0,
          duration: 0.78,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            start: "top 72%",
            trigger: "[data-subscriptions-section]",
          },
          y: 34,
        });
      });

      if (calmSection && calmTitle && calmSoft && calmStrong) {
        const calmImages = calmCards
          .map((card) => card.querySelector<HTMLElement>("img"))
          .filter((image): image is HTMLElement => Boolean(image));
        const clamp = gsap.utils.clamp;
        const cardSettings = [
          { angle: -118, cursor: 28, depth: 1.08, opacity: 0.78, radius: 0.78, rotation: -5, scale: 0.92, speed: 0.92, spin: 0.78 },
          { angle: -74, cursor: 26, depth: 1.22, opacity: 0.82, radius: 0.84, rotation: 4, scale: 0.94, speed: 1.04, spin: -0.66 },
          { angle: -28, cursor: 22, depth: 0.94, opacity: 0.68, radius: 0.9, rotation: -3, scale: 0.86, speed: 0.86, spin: 0.52 },
          { angle: 18, cursor: 30, depth: 1.18, opacity: 0.76, radius: 0.82, rotation: 6, scale: 0.92, speed: 1.12, spin: -0.72 },
          { angle: 62, cursor: 34, depth: 1.3, opacity: 0.82, radius: 0.96, rotation: 3, scale: 1.04, speed: 0.98, spin: 0.9 },
          { angle: 112, cursor: 24, depth: 1.06, opacity: 0.72, radius: 0.98, rotation: -7, scale: 0.98, speed: 1.18, spin: -0.6 },
          { angle: 154, cursor: 18, depth: 0.76, opacity: 0.54, radius: 0.88, rotation: 5, scale: 0.78, speed: 0.76, spin: 0.46 },
          { angle: 204, cursor: 26, depth: 1.14, opacity: 0.76, radius: 1, rotation: -8, scale: 0.86, speed: 1.08, spin: -0.82 },
          { angle: 248, cursor: 16, depth: 0.72, opacity: 0.5, radius: 0.74, rotation: 7, scale: 0.74, speed: 0.82, spin: 0.56 },
          { angle: 292, cursor: 24, depth: 1.02, opacity: 0.66, radius: 0.92, rotation: -4, scale: 0.88, speed: 1.24, spin: 0.64 },
          { angle: 328, cursor: 14, depth: 0.64, opacity: 0.44, radius: 0.7, rotation: 4, scale: 0.72, speed: 0.7, spin: -0.4 },
          { angle: 386, cursor: 28, depth: 1.12, opacity: 0.72, radius: 0.86, rotation: -6, scale: 0.86, speed: 1.02, spin: 0.78 },
        ];
        const flowItems = calmCards.map((card, index) => {
          const setting = cardSettings[index % cardSettings.length];

          return {
            opacityTo: gsap.quickSetter(card, "opacity") as (value: number) => void,
            rotationTo: gsap.quickSetter(card, "rotation", "deg") as (value: number) => void,
            scaleTo: gsap.quickSetter(card, "scale") as (value: number) => void,
            setting,
            xTo: gsap.quickSetter(card, "x", "px") as (value: number) => void,
            yTo: gsap.quickSetter(card, "y", "px") as (value: number) => void,
            zTo: gsap.quickSetter(card, "z", "px") as (value: number) => void,
          };
        });
        let viewportHeight = window.innerHeight;
        let viewportWidth = window.innerWidth;
        let targetProgress = 0;
        let easedProgress = 0;
        let targetVelocity = 0;
        let easedVelocity = 0;
        let targetPointerX = 0;
        let targetPointerY = 0;
        let pointerX = 0;
        let pointerY = 0;
        let scrollDirection = 1;

        gsap.set(calmTitle, {
          autoAlpha: 0,
          filter: "blur(0px)",
          scale: 0.98,
          x: 0,
          y: 0,
        });
        gsap.set(calmSoft, {
          autoAlpha: 0,
          filter: "blur(12px)",
          scale: 0.98,
          y: 20,
        });
        gsap.set(calmStrong, {
          autoAlpha: 0,
          filter: "blur(12px)",
          scale: 0.98,
          x: 0,
          y: 20,
        });
        gsap.set(calmCards, {
          autoAlpha: 1,
          filter: (index: number) => (cardSettings[index]?.depth < 0.7 ? "blur(1.8px)" : "blur(0px)"),
          force3D: true,
          left: "50%",
          top: "50%",
          transformOrigin: "50% 50%",
          xPercent: -50,
          yPercent: -50,
        });
        gsap.set(calmImages, {
          filter: "saturate(0.98) contrast(1.02)",
          scale: 1.08,
        });

        const renderCalmFlow = (time = 0) => {
          easedProgress += (targetProgress - easedProgress) * 0.095;
          easedVelocity += (targetVelocity - easedVelocity) * 0.1;
          pointerX += (targetPointerX - pointerX) * 0.075;
          pointerY += (targetPointerY - pointerY) * 0.075;
          targetVelocity *= 0.84;

          const orbitProgress = easedProgress * Math.PI * 2;
          const radiusX = clamp(240, viewportWidth * 0.36, 620);
          const radiusY = clamp(150, viewportHeight * 0.31, 305);
          const velocityLean = clamp(-12, 12, easedVelocity * 0.0048);
          const revealFade = clamp(0, 1, (easedProgress - 0.76) / 0.24);

          if (calmCount) {
            calmCount.textContent = `(${Math.round(47 + easedProgress * 14)})`;
          }

          flowItems.forEach((item, index) => {
            const { setting } = item;
            const angle = (setting.angle * Math.PI) / 180 + orbitProgress * setting.speed;
            const depthWave = (Math.sin(angle) + 1) / 2;
            const front = 0.55 + depthWave * 0.45;
            const floatX = Math.sin(time * (0.42 + index * 0.025) + index * 1.7);
            const floatY = Math.cos(time * (0.34 + index * 0.02) + index * 1.25);
            const cursorX = pointerX * setting.cursor * setting.depth;
            const cursorY = pointerY * setting.cursor * 0.62 * setting.depth;
            const orbitX = Math.cos(angle) * radiusX * setting.radius + floatX * 18 + cursorX;
            const orbitY = Math.sin(angle) * radiusY * setting.radius + floatY * 12 + cursorY;
            const entryStart = index * 0.012;
            const entryFade = clamp(0, 1, (easedProgress - entryStart) / 0.34);
            const entryEase = 1 - Math.pow(1 - entryFade, 3);
            const entryRadiusX = radiusX + viewportWidth * 0.62;
            const entryRadiusY = radiusY + viewportHeight * 0.52;
            const startX = Math.cos((setting.angle * Math.PI) / 180) * entryRadiusX * setting.radius;
            const startY = Math.sin((setting.angle * Math.PI) / 180) * entryRadiusY * setting.radius;
            const x = startX + (orbitX - startX) * entryEase;
            const y = startY + (orbitY - startY) * entryEase;

            item.xTo(x);
            item.yTo(y);
            item.zTo((front - 0.5) * 260 * setting.depth);
            item.rotationTo(
              setting.rotation +
                Math.cos(angle) * 5.5 +
                pointerX * setting.depth * 4 +
                scrollDirection * setting.spin * 1.6 +
                velocityLean * setting.spin,
            );
            item.scaleTo(
              (setting.scale * front + floatY * 0.018 + Math.min(Math.abs(easedVelocity) * 0.000012, 0.035)) *
                (0.82 + entryEase * 0.18),
            );
            item.opacityTo(setting.opacity * front * entryFade * (1 - revealFade * 0.48));
            calmCards[index].style.zIndex = `${Math.round(front * 100)}`;
          });
        };

        const calmReveal = gsap.timeline({
          scrollTrigger: {
            end: () => `+=${window.innerHeight * 1.72}`,
            invalidateOnRefresh: true,
            scrub: 0.9,
            start: "top top",
            trigger: calmSection,
          },
        });

        calmReveal
          .to(calmTitle, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.38)
          .to(
            calmSoft,
            {
              autoAlpha: 1,
              duration: 0.52,
              ease: "power4.out",
              filter: "blur(0px)",
              scale: 1,
              y: 0,
            },
            0.42,
          )
          .to(
            calmStrong,
            {
              autoAlpha: 1,
              duration: 0.56,
              ease: "power4.out",
              filter: "blur(0px)",
              scale: 1,
              x: 0,
              y: 0,
            },
            0.58,
          )
          .to(calmTitle, { duration: 0.46, ease: "power2.out", scale: 1 }, 0.72);

        ScrollTrigger.create({
          anticipatePin: 1,
          end: "+=138%",
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            viewportHeight = Math.max(620, window.innerHeight);
            viewportWidth = Math.max(320, window.innerWidth);
            targetProgress = self.progress;
            easedProgress = self.progress;
            targetVelocity = 0;
            easedVelocity = 0;
            renderCalmFlow();
          },
          onUpdate: (self) => {
            targetProgress = self.progress;
            targetVelocity = self.getVelocity();
            scrollDirection = self.direction || scrollDirection;
          },
          pin: true,
          start: "top top",
          trigger: calmSection,
        });

        const onCalmMouseMove = (event: MouseEvent) => {
          const rect = calmSection.getBoundingClientRect();
          targetPointerX = clamp(-1, 1, ((event.clientX - rect.left) / rect.width - 0.5) * 2);
          targetPointerY = clamp(-1, 1, ((event.clientY - rect.top) / rect.height - 0.5) * 2);
        };
        const onCalmMouseLeave = () => {
          targetPointerX = 0;
          targetPointerY = 0;
        };

        calmSection.addEventListener("mousemove", onCalmMouseMove);
        calmSection.addEventListener("mouseleave", onCalmMouseLeave);
        gsap.ticker.add(renderCalmFlow);
        renderCalmFlow();

        cleanups.push(() => {
          calmSection.removeEventListener("mousemove", onCalmMouseMove);
          calmSection.removeEventListener("mouseleave", onCalmMouseLeave);
          gsap.ticker.remove(renderCalmFlow);
        });
      }

      const ctaSection = document.querySelector<HTMLElement>("[data-cta-section]");
      const ctaPanel = document.querySelector<HTMLElement>("[data-cta-panel]");
      const ctaItems = gsap.utils.toArray<HTMLElement>("[data-cta-item]");

      if (ctaSection && ctaPanel) {
        gsap.set(ctaPanel, { scale: 0.99, transformOrigin: "50% 100%", yPercent: 42 });
        gsap.set(ctaItems, { autoAlpha: 0, filter: "blur(8px)", y: 46 });

        gsap
          .timeline({
            scrollTrigger: {
              anticipatePin: 1,
              end: "top 24%",
              scrub: true,
              start: "top 94%",
              trigger: ctaSection,
            },
          })
          .to(
            ctaPanel,
            {
              duration: 1,
              ease: "power3.out",
              scale: 1,
              yPercent: 0,
            },
            0,
          )
          .to(
            ctaItems,
            {
              autoAlpha: 1,
              duration: 0.58,
              ease: "power3.out",
              filter: "blur(0px)",
              stagger: 0.08,
              y: 0,
            },
            0.34,
          );
      }

      return () => {
        splitInstances.forEach((split) => split.revert());
        mm.revert();
      };
    });

    cleanups.push(() => ctx.revert());

    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", refresh);
    window.setTimeout(refresh, 250);
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
