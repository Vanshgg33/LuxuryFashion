import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND EFFECTS — Animated backgrounds and particles
═══════════════════════════════════════════════════════════════════════════ */

// Floating particles background
interface FloatingParticlesProps {
  count?: number;
  className?: string;
  color?: string;
}

export function FloatingParticles({ count = 20, className = "", color = "rgba(245, 158, 11, 0.3)" }: FloatingParticlesProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated gradient background
interface GradientBackgroundProps {
  className?: string;
  colors?: string[];
}

export function GradientBackground({
  className = "",
  colors = ["#f59e0b", "#ea580c", "#dc2626"],
}: GradientBackgroundProps) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      animate={{
        background: [
          `linear-gradient(45deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
          `linear-gradient(135deg, ${colors[1]} 0%, ${colors[2]} 50%, ${colors[0]} 100%)`,
          `linear-gradient(225deg, ${colors[2]} 0%, ${colors[0]} 50%, ${colors[1]} 100%)`,
          `linear-gradient(45deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Mesh gradient background
interface MeshGradientProps {
  className?: string;
}

export function MeshGradient({ className = "" }: MeshGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 right-0 top-1/4"
        style={{ background: "radial-gradient(circle, #ea580c 0%, transparent 70%)" }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 80, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 bottom-0 left-1/3"
        style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// Animated blobs
interface AnimatedBlobsProps {
  className?: string;
}

export function AnimatedBlobs({ className = "" }: AnimatedBlobsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.svg
        className="absolute w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="blob-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <motion.ellipse
          fill="url(#blob-gradient-1)"
          animate={{
            cx: [200, 300, 250, 200],
            cy: [200, 250, 180, 200],
            rx: [150, 180, 160, 150],
            ry: [120, 150, 130, 120],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          fill="url(#blob-gradient-2)"
          animate={{
            cx: [550, 500, 580, 550],
            cy: [350, 300, 380, 350],
            rx: [180, 160, 170, 180],
            ry: [140, 160, 150, 140],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

// Grid pattern background
interface GridPatternProps {
  className?: string;
  size?: number;
  color?: string;
}

export function GridPattern({ className = "", size = 40, color = "rgba(245, 158, 11, 0.1)" }: GridPatternProps) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

// Noise texture overlay
interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className = "", opacity = 0.03 }: NoiseOverlayProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Spotlight effect that follows cursor
interface SpotlightProps {
  className?: string;
  size?: number;
  color?: string;
}

export function Spotlight({ className = "", size = 400, color = "rgba(245, 158, 11, 0.15)" }: SpotlightProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="pointer-events-none"
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          x: position.x,
          y: position.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}

// Spice particles (food themed)
interface SpiceParticlesProps {
  className?: string;
}

export function SpiceParticles({ className = "" }: SpiceParticlesProps) {
  const spices = ["🌶️", "🍃", "⭐", "✨"];
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    emoji: spices[i % spices.length],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 16 + 12,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}
