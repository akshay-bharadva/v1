import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

interface MenuOverlayProps {
  onClose: () => void;
}

// Updated navigation links to match the new structure
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

const menuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: "easeInOut",
    },
  },
};

export default function MenuOverlay({ onClose }: MenuOverlayProps) {
  return (
    <motion.div
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8"
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-foreground transition-colors hover:text-accent"
        aria-label="Close menu"
      >
        <X size={32} />
      </button>

      <nav>
        <ul className="space-y-6 text-center">
          {NAV_LINKS.map((link) => (
            <motion.li key={link.href} variants={linkVariants}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block text-4xl font-bold text-slate-400 transition-colors hover:text-accent md:text-5xl"
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}