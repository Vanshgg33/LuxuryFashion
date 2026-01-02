import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO INTERACTIONS — Delightful small animations
═══════════════════════════════════════════════════════════════════════════ */

// Magnetic button that follows cursor
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className = "", strength = 0.3 }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// Ripple effect button
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RippleButton({ children, className = "", onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
            animate={{ width: 400, height: 400, x: -200, y: -200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// Bounce animation wrapper
interface BounceProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function Bounce({ children, className = "", scale = 1.1 }: BounceProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
interface PulseProps {
  children: ReactNode;
  className?: string;
}

export function Pulse({ children, className = "" }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Shake animation (for errors/attention)
interface ShakeProps {
  children: ReactNode;
  className?: string;
  trigger?: boolean;
}

export function Shake({ children, className = "", trigger = false }: ShakeProps) {
  const controls = useAnimation();

  if (trigger) {
    controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    });
  }

  return (
    <motion.div className={className} animate={controls}>
      {children}
    </motion.div>
  );
}

// Counter animation
interface CounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function Counter({ value, className = "", duration = 0.5 }: CounterProps) {
  return (
    <motion.span
      className={className}
      key={value}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration }}
    >
      {value}
    </motion.span>
  );
}

// Heart burst animation (for likes/favorites)
interface HeartBurstProps {
  isActive: boolean;
  className?: string;
}

export function HeartBurst({ isActive, className = "" }: HeartBurstProps) {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-500"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 30,
                  y: Math.sin((i * Math.PI * 2) / 6) * 30,
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating animation
interface FloatProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function Float({ children, className = "", duration = 3, distance = 10 }: FloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Glow animation
interface GlowProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function Glow({ children, className = "", color = "rgba(245, 158, 11, 0.5)" }: GlowProps) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className = "", speed = 50 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");

  useState(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  });

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
}

// Confetti burst
interface ConfettiProps {
  trigger: boolean;
  className?: string;
}

export function Confetti({ trigger, className = "" }: ConfettiProps) {
  const colors = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7"];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <AnimatePresence>
        {trigger && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: colors[i % colors.length],
                  left: "50%",
                  top: "50%",
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 1],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  rotate: Math.random() * 360,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: Math.random() * 0.2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
