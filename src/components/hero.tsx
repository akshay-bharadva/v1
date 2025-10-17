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
