/*
This file has been redesigned to fit the new kinetic typography theme.
- The neo-brutalist `border-2`, `rounded-none`, `shadow-[...]`, and yellow background are removed.
- The component is now a clean, text-focused section.
- The text is styled using the Tailwind Typography plugin (`prose dark:prose-invert`) for consistency and theme support.
- A `motion.div` is added for a subtle fade-in animation.
*/
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

type HeroProps = PropsWithChildren;

export default function Hero({ children }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="my-16"
    >
      <div className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
        <p>
          Bonjour! I'm a full-stack developer and life-long learner from India,
          currently living in ON, Canada. I enjoy learning new technologies and
          collaborating with other developers to make products a reality.
        </p>
        <p>
          I also enjoy open-source; despite having a full-time job, I devote
          time to exploring open-source projects and studying their tech stack
          and coding conventions.
        </p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.section>
  );
}