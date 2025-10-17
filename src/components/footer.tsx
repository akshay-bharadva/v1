import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { AiOutlineCopyrightCircle } from "react-icons/ai";
import { BsArrowUpRight, BsGithub, BsLinkedin } from "react-icons/bs";

type FooterProps = PropsWithChildren;

export default function Footer({ children }: FooterProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      );
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000 * 60);
    return () => clearInterval(timerId);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mb-20 flex flex-col items-center justify-center gap-4 border-t-2 border-black pt-10 font-space text-sm text-black md:mb-8">
      <div className="mb-4 flex gap-4">
        <Link
          href="https://github.com/akshay-bharadva"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="GitHub Profile"
          className="border-2 border-transparent p-2 text-2xl text-black transition-colors hover:border-black hover:bg-yellow-200 hover:text-indigo-700"
        >
          <BsGithub />
        </Link>
        <Link
          href="https://www.linkedin.com/in/akshay-bharadva/"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="LinkedIn Profile"
          className="border-2 border-transparent p-2 text-2xl text-black transition-colors hover:border-black hover:bg-yellow-200 hover:text-indigo-700"
        >
          <BsLinkedin />
        </Link>
      </div>

      <p className="flex flex-col items-center justify-center gap-2 md:flex-row">
        <span className="font-semibold">
          Built with{" "}
          <Link
            href="https://nextjs.org/"
            rel="noopener noreferrer"
            target="_blank"
            className="font-bold text-indigo-700 underline transition-colors hover:bg-yellow-200 hover:text-indigo-900"
          >
            Next.js <BsArrowUpRight className="inline" />
          </Link>
        </span>
        <span className="mx-1 hidden font-bold md:inline">|</span>
        <span className="font-semibold">
          View Source on{" "}
          <a
            href="https://github.com/akshay-bharadva/akshay-bharadva.github.io"
            rel="noopener noreferrer"
            target="_blank"
            className="font-bold text-indigo-700 underline transition-colors hover:bg-yellow-200 hover:text-indigo-900"
          >
            GitHub <BsArrowUpRight className="inline" />
          </a>
        </span>
      </p>
      <p className="font-bold">
        <AiOutlineCopyrightCircle className="mr-1 inline-block" />
        {currentYear} Akshay Bharadva
        {currentTime && <span className="mx-1">|</span>}
        {currentTime}
      </p>
    </footer>


  );
}