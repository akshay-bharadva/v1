import Link from "next/link";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import MenuOverlay from "./menu-overlay";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-40 w-full bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex h-20 items-center justify-between px-4 sm:px-8 md:px-16 xl:px-48 2xl:px-72">
          <Link
            href="/"
            className="text-lg font-bold text-foreground transition-colors hover:text-accent"
          >
            Akshay Bharadva
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="group relative text-lg font-bold text-foreground"
            aria-label="Open menu"
          >
            Menu
            <span className="absolute -bottom-1 left-0 h-0.5 w-full scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"></span>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {isMenuOpen && <MenuOverlay onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}