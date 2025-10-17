import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { BsArrowUpRight } from "react-icons/bs";

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

const MY_EXPERIENCES: ExperienceItem[] = [
  {
    orgName: "SigNoz Inc.",
    orgHref: "https://signoz.io/",
    position: "Freelance Open Source Contributor",
    from: "April 2023",
    to: "Present",
    desc: (
      <>
        SigNoz is an open-source observability platform that helps engineers
        monitor and troubleshoot complex distributed systems.
        <br />
        As a developer with SigNoz, I developed pages such as{" "}
        <span className="font-semibold text-indigo-600">
          “/pricing”
        </span>
        ,{" "}
        <span className="font-semibold text-indigo-600">
          “/team”
        </span>
        ,{" "}
        <span className="font-semibold text-indigo-600">
          “/enterprise”
        </span>
        , and many more.
        <br />
        My recent work upgrading the landing page was a great experience. Check
        out the landing page at{" "}
        <Link
          className="inline-flex items-center gap-1 font-bold text-indigo-700 underline transition-colors hover:bg-yellow-200 hover:text-indigo-900"
          href="https://signoz.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          signoz.io <BsArrowUpRight />
        </Link>
        .
      </>
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
      <ul className="space-y-2">
        <li className="ml-5 list-disc text-gray-800">
          Developed projects/features with a JavaScript stack including ReactJS,
          Redux, Redux-Thunk, NextJS for frontend, and NestJS, ExpressJS, NodeJS
          for backend. Utilized both relational (PostgreSQL) and non-relational
          (MongoDB) databases.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Delivered high-quality, secure, and reliable features according to
          client requirements, ensuring timely project completion.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Contributed to a project utilizing Redux-Observable with a
          well-structured coding pattern and an easily navigable directory
          structure.
        </li>
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
      <ul className="space-y-2">
        <li className="ml-5 list-disc text-gray-800">
          Developed and supported SPRING MVC and REST applications in
          collaboration with team members.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Built a REACT application and integrated it with REST APIs based on
          specifications provided by system analysts.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Worked on a project with a microservice architecture, using React for
          the front-end, Spring Boot for backend services, and a centralized
          PostgreSQL database.
        </li>
      </ul>
    ),
    techStack: [
      "React.js",
      "Java",
      "Spring Boot",
      "SQL",
      "PostgreSQL",
      "MySQL",
    ],
  },
  {
    orgName: "Finlogic Technologies India Pvt. Ltd.",
    orgHref: "https://njtechnologies.in/",
    position: "Fullstack Developer - Intern",
    from: "Jan 2022",
    to: "Apr 2022",
    desc: (
      <ul className="space-y-2">
        <li className="ml-5 list-disc text-gray-800">
          Gained experience in full-stack development using Java technologies,
          HTML5, CSS3, JavaScript (ES6), and AJAX. Learned SQL & PL/SQL,
          including creating views, functions, procedures, and triggers.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Developed functionality for a Teacher/Mentor module, enabling dynamic
          question insertion for exams with a rich text editor integration.
        </li>
        <li className="ml-5 list-disc text-gray-800">
          Contributed to UI/UX development in JSP and React, working on various
          sections of Admin and User Modules.
        </li>
      </ul>
    ),
    techStack: [
      "JSP",
      "Java",
      "Spring MVC",
      "SQL/PL-SQL",
      "MySQL",
      "HTML5",
      "CSS3",
    ],
  },
];

export default function Experience({ children }: ExperienceProps) {
  return (
    <section className="my-8 font-space">
      <h2 className="mb-6 border-b-4 border-black pb-2 text-3xl font-black text-black">
        Experience
      </h2>
      <div className="relative flex flex-col py-10 pl-5 after:absolute after:left-[3px] after:top-0 after:h-full after:w-[3px] after:bg-black after:content-['']">
        {MY_EXPERIENCES.map((experience) => (
          <div
            key={`${experience.orgName}- ${experience.position}`}
            className="group relative mb-10 rounded-none border-2 border-black bg-card p-6 pl-10 shadow-[6px_6px_0px_#000] transition-shadow duration-150 last-of-type:mb-0 hover:shadow-[8px_8px_0px_#4f46e5]"
          >
            <span className="absolute -left-[11px] top-7 z-10 h-5 w-5 rotate-45 rounded-none border-2 border-black bg-yellow-400 shadow-[1px_1px_0_#000] transition-colors group-hover:bg-indigo-500" />
            <Link
              href={experience.orgHref}
              className="mb-1 block"
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              <p className="text-sm font-semibold text-gray-600">
                {experience.from} - {experience.to}
              </p>
              <h3 className="flex items-center text-2xl font-bold text-black transition-colors group-hover:text-indigo-700">
                {experience.orgName}{" "}
                <BsArrowUpRight className="ml-1.5 inline-block h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:rotate-[15deg]" />
              </h3>
            </Link>
            <p className="mb-3 text-lg font-semibold text-gray-800">
              {experience.position}
            </p>
            <div className="prose prose-sm prose-nb mb-4 max-w-none text-sm leading-relaxed text-gray-700">
              {experience.desc}
            </div>
            {experience.techStack.length > 0 && (
              <div className="mt-4 border-t border-gray-300 pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  Tech Stack:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {experience.techStack.map((tech) => (
                    <small
                      key={tech}
                      className="flex-inline rounded-none border border-black bg-gray-200 px-2 py-0.5 text-xs font-semibold text-black shadow-[1px_1px_0px_#000]"
                    >
                      {tech}
                    </small>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section >
  );
}