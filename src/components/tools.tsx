// This component now fetches its data dynamically from Supabase.
// The hardcoded USED_TOOLS array has been removed.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsArrowUpRight } from "react-icons/bs";
import { supabase } from "@/supabase/client";
import type { PortfolioItem } from "@/types";

export default function Tools() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('portfolio_items(*)')
        .eq('title', 'Tools')
        .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
        .single();

      if (data?.portfolio_items) {
        setItems(data.portfolio_items);
      }
      if (error) {
        console.error("Error fetching tools:", error);
      }
      setIsLoading(false);
    };
    fetchTools();
  }, []);

  if (isLoading) {
    return <div className="py-24 text-center">Loading Tools...</div>;
  }

  if (items.length === 0) {
    return null; // Don't render the section if there's no content
  }

  return (
    <section className="border-t border-white/10 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="mb-12 text-center text-4xl font-bold text-slate-400 md:text-5xl"
      >
        Tools I Use
      </motion.h2>
      <div className="mx-auto max-w-4xl">
        {items.map((tool, index) => (
          <motion.a
            key={tool.id}
            href={tool.link_url || "#"}
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
                {tool.title}
              </h3>
              <BsArrowUpRight className="text-xl text-slate-500 transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent" />
            </div>
            {tool.description && <p className="mt-2 text-slate-400">{tool.description}</p>}
          </motion.a>
        ))}
      </div>
    </section>
  );
}