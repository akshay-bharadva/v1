/*
This file is updated for the new kinetic typography theme.
- The neo-brutalist header and card styles are removed.
- The section now has a clean, modern title.
- The tool items are displayed in the redesigned `Card` component for consistency with the `Technology` section.
- Link styling and fonts are updated to match the new theme.
*/
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ToolsProps = PropsWithChildren;

interface ToolItem {
  name: string;
  href: string;
  desc: string;
}

const USED_TOOLS: ToolItem[] = [
  { name: "Visual Studio Code", href: "https://code.visualstudio.com/", desc: "My all-time favorite text editor with superpowers. Indispensable for daily coding tasks." },
  { name: "Figma", href: "https://www.figma.com/", desc: "For turning UI/UX designs into real, functional products. Excellent for collaboration." },
  { name: "GitHub", href: "https://github.com/", desc: "Essential for version control, remote backups, and collaborating with other developers." },
  { name: "Slack", href: "https://slack.com/", desc: "Communication is key. Also, many Open-Source communities use it for interaction." },
  { name: "Discord", href: "https://discord.com/", desc: "Initially joined for gaming, but later discovered many awesome developer communities." },
  { name: "Postman", href: "https://www.postman.com/", desc: "The go-to tool for API testing and development. Simplifies debugging endpoints significantly." },
];

export default function Tools({ children }: ToolsProps) {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Tools I Use
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {USED_TOOLS.map((tool) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tool.name}
                  <a
                    href={tool.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-muted-foreground transition-colors hover:text-accent"
                    aria-label={`Learn more about ${tool.name}`}
                  >
                    <BsArrowUpRight className="size-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}