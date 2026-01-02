import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   3D CARD EFFECTS — Interactive 3D hover animations
═══════════════════════════════════════════════════════════════════════════ */

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export function Card3D({ children, className = "", intensity = 15, glare = true }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      {children}
      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-inherit"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            borderRadius: "inherit",
          }}
        />
      )}
    </motion.div>
  );
}

// Flip card component
interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = "" }: FlipCardProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover="flipped"
      initial="front"
    >
      <motion.div
        className="absolute inset-0 backface-hidden"
        style={{ backfaceVisibility: "hidden" }}
        variants={{
          front: { rotateY: 0 },
          flipped: { rotateY: 180 },
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {front}
      </motion.div>
      <motion.div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        variants={{
          front: { rotateY: 180 },
          flipped: { rotateY: 360 },
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {back}
      </motion.div>
    </motion.div>
  );
}

// Tilt on scroll
interface TiltScrollProps {
  children: ReactNode;
  className?: string;
}

export function TiltScroll({ children, className = "" }: TiltScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ rotateX: 45, opacity: 0 }}
      whileInView={{ rotateX: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverLift({ children, className = "", liftAmount = 10 }: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftAmount,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Image zoom on hover
interface ZoomImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ZoomImage({ src, alt, className = "" }: ZoomImageProps) {
  return (
    <motion.div className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// Perspective wrapper
interface PerspectiveProps {
  children: ReactNode;
  className?: string;
}

export function Perspective({ children, className = "" }: PerspectiveProps) {
  return (
    <motion.div
      className={className}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      initial={{ rotateX: 25, y: 50, opacity: 0 }}
      whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
