// This component now fetches its data dynamically from Supabase.
// The hardcoded TECHNOLOGIES array has been removed.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsArrowUpRight } from "react-icons/bs";
import { supabase } from "@/supabase/client";
import type { PortfolioItem } from "@/types";

export default function Technology() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTech = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('portfolio_items(*)')
        .eq('title', 'Tech Stack')
        .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
        .single();

      if (data?.portfolio_items) {
        setItems(data.portfolio_items);
      }
       if (error) {
        console.error("Error fetching tech stack:", error);
      }
      setIsLoading(false);
    };
    fetchTech();
  }, []);
  
  if (isLoading) {
    return <div className="py-24 text-center">Loading Tech Stack...</div>;
  }

  if (items.length === 0) {
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
        My Tech Stack
      </motion.h2>
      <div className="mx-auto max-w-4xl">
        {items.map((tech, index) => (
          <motion.a
            key={tech.id}
            href={tech.link_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.1 }}
            className="group block border-b border-white/10 px-4 py-6 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-200 transition-colors group-hover:text-accent">
                {tech.title}
              </h3>
              <BsArrowUpRight className="text-xl text-slate-500 transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent" />
            </div>
            {tech.description && <p className="mt-2 text-slate-400">{tech.description}</p>}
          </motion.a>
        ))}
      </div>
    </section>
  );
}