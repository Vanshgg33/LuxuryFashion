import { motion, useAnimation, useInView } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT ANIMATIONS — Stunning text reveal effects
═══════════════════════════════════════════════════════════════════════════ */

// Split text animation - reveals character by character
interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function SplitText({ children, className = "", delay = 0, staggerDelay = 0.03 }: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const words = children.split(" ");

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap ${className}`}
      initial="hidden"
      animate={controls}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="mr-[0.25em] flex">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: -90 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: {
                    duration: 0.5,
                    delay: delay + (wordIndex * word.length + charIndex) * staggerDelay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}

// Gradient text animation
interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function GradientText({
  children,
  className = "",
  colors = ["#f59e0b", "#ea580c", "#dc2626", "#f59e0b"],
}: GradientTextProps) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}

// Word by word reveal
interface WordRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function WordReveal({ children, className = "", delay = 0 }: WordRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const words = children.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="mr-[0.25em] inline-block overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + index * 0.1 }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{
              delay: delay + index * 0.1,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </div>
  );
}

// Line reveal with mask
interface LineRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function LineReveal({ children, className = "", delay = 0 }: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : {}}
        transition={{
          delay,
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Scramble text effect
interface ScrambleTextProps {
  children: string;
  className?: string;
  duration?: number;
}

export function ScrambleText({ children, className = "", duration = 1000 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  useEffect(() => {
    if (!isInView || !ref.current) return;

    const originalText = children;
    const element = ref.current;
    let iteration = 0;
    const interval = duration / originalText.length;

    const scrambleInterval = setInterval(() => {
      element.innerText = originalText
        .split("")
        .map((char, index) => {
          if (index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (iteration >= originalText.length) {
        clearInterval(scrambleInterval);
      }

      iteration += 1 / 3;
    }, interval / 3);

    return () => clearInterval(scrambleInterval);
  }, [isInView, children, duration]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

// Counting number animation
interface CountingNumberProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function CountingNumber({
  value,
  className = "",
  duration = 2,
  prefix = "",
  suffix = "",
}: CountingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView && (
          <motion.span
            initial={0}
            animate={value}
            transition={{ duration, ease: "easeOut" }}
          >
            {(latest: number) => Math.round(latest as number)}
          </motion.span>
        )}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Glitch text effect
interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover="glitch"
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 text-red-500 z-0"
        variants={{
          glitch: {
            x: [0, -2, 2, -2, 0],
            opacity: [0, 1, 1, 1, 0],
          },
        }}
        transition={{ duration: 0.3, repeat: 2 }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-blue-500 z-0"
        variants={{
          glitch: {
            x: [0, 2, -2, 2, 0],
            opacity: [0, 1, 1, 1, 0],
          },
        }}
        transition={{ duration: 0.3, repeat: 2, delay: 0.05 }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// Highlighted text animation
interface HighlightTextProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function HighlightText({
  children,
  className = "",
  color = "rgba(245, 158, 11, 0.3)",
}: HighlightTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`relative inline ${className}`}>
      <motion.span
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      />
      {children}
    </span>
  );
}

// Wavy text animation
interface WavyTextProps {
  children: string;
  className?: string;
}

export function WavyText({ children, className = "" }: WavyTextProps) {
  return (
    <span className={className}>
      {children.split("").map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: index * 0.05,
            ease: "easeInOut",
          }}
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
