import { motion } from "framer-motion";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BsGithub, BsLinkedin } from "react-icons/bs";

type LittleAboutMyselfProps = PropsWithChildren;

export default function LittleAboutMyself({
  children,
}: LittleAboutMyselfProps) {
  const heading = "Akshay Bharadva";
  const subheading = "Fullstack Developer.";

  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeOut",
        duration: 0.6,
      },
    },
  };
  
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center overflow-hidden text-center">
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-4 text-xl text-slate-400 sm:text-2xl"
        >
          Bonjour, je suis
        </motion.p>

        <motion.h1
          variants={sentenceVariants}
          initial="hidden"
          animate="visible"
          className="text-6xl font-black text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
          aria-label={heading}
        >
          {heading.split(" ").map((word, wordIndex) => (
            <span
              key={`word-${wordIndex}`}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={`char-${charIndex}`}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              {wordIndex < heading.split(" ").length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-4 text-3xl font-bold text-accent sm:text-4xl md:text-5xl"
        >
          {subheading}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="mt-12 flex justify-center gap-6 sm:gap-8"
        >
          <a
            href="https://github.com/akshay-bharadva"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="GitHub Profile"
            className="text-3xl text-slate-400 transition-colors hover:text-accent sm:text-4xl"
          >
            <BsGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/akshay-bharadva/"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="LinkedIn Profile"
            className="text-3xl text-slate-400 transition-colors hover:text-accent sm:text-4xl"
          >
            <BsLinkedin />
          </a>
          <a
            href="mailto:akshaybharadva19@gmail.com"
            aria-label="Email Akshay"
            className="text-3xl text-slate-400 transition-colors hover:text-accent sm:text-4xl"
          >
            <AiOutlineMail />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
