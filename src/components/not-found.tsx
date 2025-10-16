import { PropsWithChildren } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
  return (
    <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 text-center"
    >
      <div>
        <h1 className="text-5xl font-black text-accent md:text-7xl">404</h1>
        <p className="mt-4 text-xl text-slate-300">Whoops! Looks like this page took a wrong turn.</p>
        <p className="mt-2 text-slate-400">Let's get you back on track.</p>
        
        {children && <div className="my-8">{children}</div>}
        
        <Button asChild className="mt-8">
          <Link href="/">
            Go Home <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}