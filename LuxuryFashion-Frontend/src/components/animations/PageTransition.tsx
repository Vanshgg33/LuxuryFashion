import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE TRANSITION — Smooth page-to-page animations
═══════════════════════════════════════════════════════════════════════════ */

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Slide variants for different directions
export const slideVariants = {
  left: {
    initial: { x: -100, opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { x: 100, opacity: 0, transition: { duration: 0.3 } },
  },
  right: {
    initial: { x: 100, opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.3 } },
  },
  up: {
    initial: { y: 100, opacity: 0 },
    enter: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { y: -100, opacity: 0, transition: { duration: 0.3 } },
  },
  down: {
    initial: { y: -100, opacity: 0 },
    enter: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { y: 100, opacity: 0, transition: { duration: 0.3 } },
  },
};
