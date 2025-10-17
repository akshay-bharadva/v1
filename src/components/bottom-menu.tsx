import Link from "next/link";
import { useRouter } from "next/router";
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineAppstore,
  AiFillAppstore,
  AiOutlineExperiment,
  AiFillExperiment,
  AiOutlineRead,
  AiFillRead,
} from "react-icons/ai";
import { FaUser, FaRegUser } from "react-icons/fa";

import { IconType } from "react-icons";

type NavLink = {
  href: string;
  label: string;
  icon: IconType;
  activeIcon: IconType;
};

const NavLinks: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: AiOutlineHome,
    activeIcon: AiFillHome,
  },
  {
    href: "/showcase",
    label: "Showcase",
    icon: AiOutlineAppstore,
    activeIcon: AiFillAppstore,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: AiOutlineExperiment,
    activeIcon: AiFillExperiment,
  },
  {
    href: "/blog",
    label: "Blog",
    icon: AiOutlineRead,
    activeIcon: AiFillRead,
  },
  {
    href: "/about",
    label: "About",
    icon: FaRegUser,
    activeIcon: FaUser,
  },
];

export default function BottomNavBar() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t-2 border-black bg-background font-space shadow-[0px_-2px_0px_#000] md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {NavLinks.map((link) => {
          const isActive =
            router.pathname === link.href ||
            (link.href !== "/" && router.pathname.startsWith(link.href));
          const IconComponent = isActive ? link.activeIcon : link.icon;

          return (
            <Link
              href={link.href}
              key={link.href}
              className={`group flex flex-col items-center justify-center rounded-none p-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white
            ${isActive
                  ? "text-indigo-700"
                  : "text-gray-600 hover:text-black"
                }`}
              aria-label={link.label}
            >
              <IconComponent className="mb-0.5 text-2xl" />
              <span
                className={`text-xs font-semibold 
              ${isActive ? "text-indigo-700" : "text-gray-500 group-hover:text-black"}`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>


  );
}