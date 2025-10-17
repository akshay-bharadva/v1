import { PropsWithChildren } from "react";
import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-16 flex min-h-[50vh] flex-col items-center justify-center text-center"
    >
      <h1 className="text-8xl font-black tracking-tighter text-foreground sm:text-9xl">
        404
      </h1>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Page Not Found
      </p>
      <p className="mt-6 max-w-md text-base text-muted-foreground">
        Whoops! Looks like this page took a wrong turn at Albuquerque. Let's get
        you back on track.
      </p>

      {children && <div className="my-8">{children}</div>}

      <Button asChild className="mt-8">
        <Link href="/">
          Go Home <BsArrowUpRight className="ml-1.5 inline" />
        </Link>
      </Button>
    </motion.section>
  );
}
