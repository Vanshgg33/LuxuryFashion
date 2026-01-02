import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./footer";
import { StickyCartBar } from "./StickyCartBar";
import { SmoothScroll, ScrollProgress } from "./animations";

/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT — Main app layout with page transitions & smooth scroll
═══════════════════════════════════════════════════════════════════════════ */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Scroll Progress Bar */}
        <ScrollProgress />

        <Navbar />
        {/* Spacer for fixed navbar - not needed on homepage as hero extends under navbar */}
        {!isHomePage && <div className="h-16 md:h-20" />}

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex-1"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>

        <Footer />
        <StickyCartBar />
      </div>
    </SmoothScroll>
  );
}
