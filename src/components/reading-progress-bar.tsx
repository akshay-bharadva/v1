// This is a new component to display a reading progress bar at the top of the page.
// It uses Framer Motion's `useScroll` and `useSpring` hooks for a smooth animation.

import { motion, useScroll, useSpring } from "framer-motion";

export default function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left bg-accent z-50"
      style={{ scaleX }}
    />
  );
}