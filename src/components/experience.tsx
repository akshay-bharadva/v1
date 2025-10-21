import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type ExperienceProps = PropsWithChildren;

interface ExperienceItem {
  orgName: string;
  orgHref: string;
  position: string;
  from: string;
  to: string;
  desc: ReactNode;
  techStack: string[];
}

// DATA STRUCTURE IS UNCHANGED - ONLY JSX/STYLES IN `desc` are cleaned up for better rendering
const MY_EXPERIENCES: ExperienceItem[] = [
  {
    orgName: "SigNoz Inc.",
    orgHref: "https://signoz.io/",
    position: "Freelance Open Source Contributor",
    from: "April 2023",
    to: "Present",
    desc: (
        <p>
            As an open-source contributor, I developed key pages like Pricing, Team, and Enterprise, and played a major role in the new landing page redesign. Check it out at <a href="https://signoz.io/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-4">signoz.io</a>.
        </p>
    ),
    techStack: ["React.js", "Docusaurus", "TypeScript"],
  },
  {
    orgName: "Digipie Technologies LLP.",
    orgHref: "https://digipie.net/",
    position: "React Developer",
    from: "Dec 2022",
    to: "Aug 2023",
    desc: (
      <ul>
        <li>Developed full-stack features using React, Redux, Next.js, and Nest.js with both SQL and NoSQL databases.</li>
        <li>Delivered high-quality, secure, and reliable features according to client requirements.</li>
        <li>Contributed to a project utilizing Redux-Observable with a well-structured coding pattern.</li>
      </ul>
    ),
    techStack: ["React.js", "Next.js", "Node.js", "MongoDB", "PostgreSQL"],
  },
  {
    orgName: "Finlogic Technologies India Pvt. Ltd.",
    orgHref: "https://njtechnologies.in/",
    position: "Senior Executive, Fullstack Developer",
    from: "May 2022",
    to: "Nov 2022",
    desc: (
        <ul>
            <li>Developed and supported SPRING MVC and REST applications in a microservice architecture.</li>
            <li>Built a React application from the ground up and integrated it with REST APIs based on specifications.</li>
        </ul>
    ),
    techStack: ["React.js", "Java", "Spring Boot", "PostgreSQL", "MySQL"],
  },
  {
    orgName: "Finlogic Technologies India Pvt. Ltd.",
    orgHref: "https://njtechnologies.in/",
    position: "Fullstack Developer - Intern",
    from: "Jan 2022",
    to: "Apr 2022",
    desc: (
        <ul>
            <li>Gained foundational experience in full-stack development using Java, Spring MVC, JSP, and SQL/PL-SQL.</li>
            <li>Developed functionality for a Teacher/Mentor module with a rich text editor integration.</li>
        </ul>
    ),
    techStack: ["JSP", "Java", "Spring MVC", "SQL/PL-SQL", "MySQL", "HTML5"],
  },
];

export default function Experience({ children }: ExperienceProps) {
  return (
    <section className="my-16 py-16">
      {/* --- Section Header --- */}
      <motion.div 
        className="relative mb-16 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-black text-foreground md:text-5xl">
          Experience
        </h2>
        <div className="mx-auto mt-4 h-1.5 w-24 bg-accent" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[6rem] font-black text-accent/5 -z-10" aria-hidden="true">
          CAREER
        </span>
      </motion.div>

      {/* --- The Timeline --- */}
      <div className="relative mx-auto max-w-5xl px-4">
        {/* The Vertical Line */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border" aria-hidden="true" />

        <div className="space-y-12">
          {MY_EXPERIENCES.map((exp, index) => (
            <motion.div
              key={`${exp.orgName}-${exp.position}`}
              className="group relative flex items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-border transition-colors group-hover:bg-accent" />

              {/* Content Card */}
              <div
                className={`w-[calc(50%-2rem)] ${index % 2 === 0 ? 'mr-auto text-right' : 'ml-auto text-left'}`}
              >
                <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 group-hover:border-accent/50 group-hover:shadow-lg group-hover:-translate-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">{exp.from} - {exp.to}</p>
                  <h3 className="text-xl font-bold text-foreground">{exp.position}</h3>
                  <Link href={exp.orgHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-md font-medium text-accent transition-opacity hover:opacity-80">
                    {exp.orgName} <BsArrowUpRight className="size-3" />
                  </Link>
                  
                  <div className={`prose prose-sm dark:prose-invert mt-3 max-w-none text-muted-foreground ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    {exp.desc}
                  </div>

                  {exp.techStack.length > 0 && (
                    <div className={`mt-4 flex flex-wrap gap-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      {exp.techStack.map(tech => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {children && <div className="mt-16">{children}</div>}
    </section>
  );
}