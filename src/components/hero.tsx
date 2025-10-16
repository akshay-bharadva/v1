// This component is simplified and refactored for the new design.
// The blocky, neo-brutalist styling is removed.
// Framer Motion is used for a subtle scroll-triggered animation.

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-32"
    >
      <p className="text-xl leading-relaxed text-slate-300 md:text-2xl md:leading-loose">
        I'm a full-stack developer and life-long learner from India, currently based in ON, Canada. I thrive on learning new technologies and collaborating with teams to transform ideas into reality. I also have a passion for open-source, dedicating time to explore projects, understand their architecture, and contribute back to the community.
      </p>
    </motion.section>
  );
}