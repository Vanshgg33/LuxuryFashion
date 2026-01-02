import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   CURSOR EFFECTS — Custom cursor and hover animations
═══════════════════════════════════════════════════════════════════════════ */

// Custom cursor component
interface CustomCursorProps {
  color?: string;
  size?: number;
  mixBlendMode?: string;
}

export function CustomCursor({
  color = "#f59e0b",
  size = 20,
  mixBlendMode = "difference",
}: CustomCursorProps) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [cursorX, cursorY, size]);

  // Only show on desktop
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: size,
          height: size,
          backgroundColor: color,
          mixBlendMode: mixBlendMode as any,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Cursor trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-2"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: size * 2,
          height: size * 2,
          borderColor: color,
          marginLeft: -size / 2,
          marginTop: -size / 2,
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 0.5 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
    </>
  );
}

// Cursor follower with emoji/icon
interface CursorFollowerProps {
  children: ReactNode;
  className?: string;
}

export function CursorFollower({ children, className = "" }: CursorFollowerProps) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 15, stiffness: 200 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// Trail effect
interface CursorTrailProps {
  count?: number;
  color?: string;
}

export function CursorTrail({ count = 10, color = "#f59e0b" }: CursorTrailProps) {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: Date.now() };
      setTrail((prev) => [...prev.slice(-count + 1), newPoint]);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [count]);

  // Only show on desktop
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile) return null;

  return (
    <>
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed pointer-events-none z-[9997] rounded-full"
          style={{
            left: point.x,
            top: point.y,
            width: 8 - (count - index) * 0.5,
            height: 8 - (count - index) * 0.5,
            backgroundColor: color,
            opacity: (index + 1) / count * 0.5,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      ))}
    </>
  );
}

// Hover glow effect for elements
interface HoverGlowProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function HoverGlow({ children, className = "", color = "rgba(245, 158, 11, 0.4)" }: HoverGlowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Spotlight cursor effect for cards
interface SpotlightCursorProps {
  children: ReactNode;
  className?: string;
}

export function SpotlightCursor({ children, className = "" }: SpotlightCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        background: isHovering
          ? `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`
          : "transparent",
      }}
    >
      {children}
    </div>
  );
}
