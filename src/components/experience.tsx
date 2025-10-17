import { useState, useEffect } from "react";
import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { PortfolioItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

const ExperienceSkeleton = () => (
    <div className="relative mx-auto max-w-3xl border-l border-zinc-700 pl-8">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="relative pb-12 last:pb-0">
                <span className="absolute -left-[37px] top-1 z-10 size-3 rounded-full bg-zinc-700 ring-4 ring-background" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-6 w-80 mb-3" />
                <Skeleton className="h-12 w-full" />
                <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

export default function Experience() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('portfolio_items(*)')
        .eq('title', 'Experience')
        .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
        .single();

      if (data?.portfolio_items) {
        setItems(data.portfolio_items);
      }
      if (error) {
        console.error("Error fetching experience:", error.message);
      }
      setIsLoading(false);
    };
    fetchExperience();
  }, []);

  if (items.length === 0 && !isLoading) {
    return null; // Don't render the section if there's no content
  }

  return (
    <section className="py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="mb-12 text-center text-4xl font-bold text-slate-400 md:text-5xl"
      >
        Work Experience
      </motion.h2>
      
      {isLoading ? <ExperienceSkeleton /> : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-3xl border-l border-zinc-700 pl-8"
        >
          {items.map((item) => {
            const [orgName, dateRange] = item.subtitle?.split('@').map(s => s.trim()) || ["", ""];
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group relative pb-12 last:pb-0"
              >
                <span className="absolute -left-[37px] top-1 z-10 size-3 rounded-full bg-zinc-600 ring-4 ring-background transition-colors group-hover:bg-accent" />
                {dateRange && <p className="text-sm text-slate-500">{dateRange}</p>}
                <h3 className="mt-1 text-xl font-bold text-slate-100">
                  {item.title} at{" "}
                  <Link
                    href={item.link_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-baseline text-accent transition-all hover:underline"
                  >
                    {orgName || "Company"}
                    <BsArrowUpRight className="ml-1 inline-block size-3" />
                  </Link>
                </h3>
                {item.description && <p className="mt-2 text-slate-400">{item.description}</p>}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  );
}