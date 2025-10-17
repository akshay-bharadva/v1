/*
This file is updated for the new kinetic typography theme.
- The heavy neo-brutalist header is replaced with a clean, modern title.
- The technology items are now displayed in `Card` components for a cleaner, more structured look, replacing the simple bordered boxes.
- The link styling is updated to use the theme's `accent` color.
- `font-space` is removed to inherit the global `font-sans`.
*/
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TechnologyProps = PropsWithChildren;

interface TechItem {
  name: string;
  href: string;
  desc: string;
}

const TECHNOLOGIES: TechItem[] = [
  { name: "React", href: "https://react.dev/", desc: "My go-to library for crafting dynamic and interactive single-page applications (SPAs)." },
  { href: "https://redux-toolkit.js.org/", name: "Redux Toolkit", desc: "Essential for managing complex application state, ensuring predictability and maintainability." },
  { href: "https://nextjs.org/", name: "Next.js", desc: "Powers this website! Perfect for server-side rendering, static sites, and a great developer experience." },
  { href: "https://www.mysql.com/", name: "MySQL", desc: "A classic, reliable relational database management system. Widely adopted and robust." },
  { href: "https://www.prisma.io/", name: "Prisma", desc: "Modern TypeScript ORM that makes database interactions type-safe, intuitive, and enjoyable." },
  { href: "https://tailwindcss.com/", name: "Tailwind CSS", desc: "A utility-first CSS framework that accelerates UI development and makes styling enjoyable." },
];

export default function Technology({ children }: TechnologyProps) {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        My Tech Stack
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TECHNOLOGIES.map((tech) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tech.name}
                  <a
                    href={tech.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-muted-foreground transition-colors hover:text-accent"
                    aria-label={`Learn more about ${tech.name}`}
                  >
                    <BsArrowUpRight className="size-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}