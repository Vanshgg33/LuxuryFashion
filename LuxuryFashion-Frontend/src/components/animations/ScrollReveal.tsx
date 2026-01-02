import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL REVEAL — GSAP ScrollTrigger powered animations
═══════════════════════════════════════════════════════════════════════════ */

interface ScrollRevealProps {
  children: ReactNode;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale" | "rotate";
  delay?: number;
  duration?: number;
  className?: string;
  start?: string;
  scrub?: boolean | number;
}

export function ScrollReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.8,
  className = "",
  start = "top 85%",
  scrub = false,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animations = {
      fadeUp: { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } },
      fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      slideLeft: { from: { opacity: 0, x: -100 }, to: { opacity: 1, x: 0 } },
      slideRight: { from: { opacity: 0, x: 100 }, to: { opacity: 1, x: 0 } },
      scale: { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } },
      rotate: { from: { opacity: 0, rotation: -10 }, to: { opacity: 1, rotation: 0 } },
    };

    const { from, to } = animations[animation];

    gsap.set(element, from);

    gsap.to(element, {
      ...to,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start,
        scrub,
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animation, delay, duration, start, scrub]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Parallax effect component
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [speed]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Text reveal animation
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".char");

    gsap.set(chars, { opacity: 0, y: 50 });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [delay, text]);

  return (
    <div ref={containerRef} className={className}>
      {text.split("").map((char, index) => (
        <span key={index} className="char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
          {char}
        </span>
      ))}
    </div>
  );
}

// Horizontal scroll section
interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollContent = scrollRef.current;
    if (!container || !scrollContent) return;

    const scrollWidth = scrollContent.scrollWidth - window.innerWidth;

    gsap.to(scrollContent, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div ref={scrollRef} className="flex">
        {children}
      </div>
    </div>
  );
}
