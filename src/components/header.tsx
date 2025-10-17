/*
This file has been slightly adjusted for consistency with the new mobile header.
- The height is standardized by adjusting padding (`py-4`) and container height to ensure a consistent top margin for the main content on desktop screens.
- The `hidden md:block` classes ensure this header only appears on medium screens and larger, leaving mobile views to the new `MobileHeader` component.
- The container width settings have been updated to match the main layout container.
*/
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import Container from "./container";

type HeaderProps = PropsWithChildren;

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ children }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const linkClasses = (href: string) => {
    const isActive =
      router.pathname === href || (href !== "/" && router.pathname.startsWith(href));
    return `relative cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring 
    ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
    }`;
  };

  return (
    <header className="fixed left-0 top-0 z-50 hidden w-full border-b border-border bg-background/80 py-3 backdrop-blur-sm md:block">
      <Container>
      <div className="flex h-10 max-w-7xl items-center justify-between ">
        <nav className="flex items-center gap-x-1 rounded-lg bg-secondary/50 p-1">
          {NAV_LINKS.map((link) => (
            <Link
              className={linkClasses(link.href)}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      </Container>
    </header>
  );
}