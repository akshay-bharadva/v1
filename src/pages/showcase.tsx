// The Showcase page is refactored to use the new dark theme and minimalist components.
// - It now dynamically renders different card types based on the section title (e.g., "Experience", "Projects").
// - The blocky, neo-brutalist styles are replaced with clean, modern list and card layouts.
// - Framer Motion is used for staggered animations.

import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { fetchPortfolioSectionsWithItems } from "@/lib/api";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";

const portfolioMarkdownComponents: any = {
  p: ({ node, ...props }: any) => ( <p className="mb-2 text-sm leading-relaxed text-slate-400" {...props} /> ),
  a: ({ node, ...props }: any) => ( <a href={props.href || "#"} className="text-accent underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer" {...props} /> ),
  ul: ({ node, ...props }: any) => ( <ul className="list-inside list-disc space-y-0.5 pl-1 text-sm text-slate-400" {...props} /> ),
};

const ExperienceTimelineItem: React.FC<{ item: PortfolioItem }> = ({ item }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="group relative border-l border-zinc-700 pl-8 pb-12 last:pb-0"
  >
    <span className="absolute -left-[5px] top-1 z-10 size-2.5 rounded-full bg-zinc-600 ring-8 ring-background transition-colors group-hover:bg-accent" />
    <p className="text-sm text-slate-500">{item.subtitle}</p>
    <h3 className="mt-1 text-xl font-bold text-slate-100">{item.title}</h3>
    {item.description && (
      <div className="prose prose-invert prose-sm mt-2 max-w-none text-slate-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={portfolioMarkdownComponents}>{item.description}</ReactMarkdown>
      </div>
    )}
  </motion.div>
);

const ProjectShowcaseCard: React.FC<{ item: PortfolioItem }> = ({ item }) => (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-accent hover:-translate-y-1">
      {item.image_url && (<div className="relative aspect-video w-full overflow-hidden border-b border-white/10"><img src={item.image_url} alt={`Cover for ${item.title}`} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"/></div>)}
      <div className="flex grow flex-col p-6">
        <h3 className="mb-1 text-xl font-bold text-slate-100 transition-colors group-hover:text-accent">{item.title}</h3>
        {item.subtitle && (<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.subtitle}</p>)}
        {item.description && (<div className="prose prose-invert prose-sm mb-4 max-w-none flex-grow text-slate-400 line-clamp-3"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={portfolioMarkdownComponents}>{item.description}</ReactMarkdown></div>)}
        <div className="mt-auto">
            {item.link_url && (<Link href={item.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-accent underline-offset-4 hover:underline">View Project <BsArrowUpRight className="ml-1.5" /></Link>)}
        </div>
      </div>
    </div>
);


export default function ShowcasePage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `Showcase | ${siteConfig.title}`;
  const pageDescription = `A showcase of Akshay Bharadva's work, including projects, skills, and professional experience.`;
  const pageUrl = `${siteConfig.url}/showcase/`;

  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sectionsData = await fetchPortfolioSectionsWithItems();
        setSections(sectionsData);
      } catch (e: any) { setError(e.message || "Failed to load showcase content."); }
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) { return <Layout><div className="flex min-h-screen items-center justify-center text-lg font-bold">Loading Showcase...</div></Layout>; }
  if (error) { return <Layout><div className="flex min-h-screen items-center justify-center p-4 text-red-400">Error loading showcase: {error}</div></Layout>; }

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-16 font-sans md:py-24">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16 text-center">
          <h1 className="text-5xl font-black text-slate-100 md:text-6xl">SHOWCASE</h1>
          <p className="mt-4 text-xl text-slate-400">A curated collection of my work, skills, and journey.</p>
        </motion.header>

        {sections.length === 0 && !isLoading && ( 
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-dashed border-zinc-700 p-12 text-center">
            <h3 className="text-xl font-bold text-slate-300">Content Under Construction</h3>
            <p className="text-zinc-400">This showcase is currently being polished. Check back soon!</p>
          </motion.div>
         )}

        {sections.map((section, sectionIndex) => (
          <motion.section key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * sectionIndex, duration: 0.4 }} className="mb-24">
            <h2 className="mb-10 text-center text-4xl font-bold text-slate-400">{section.title}</h2>
            
            {section.type === "markdown" && section.content && (
              <div className="prose prose-lg prose-invert mx-auto"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{section.content}</ReactMarkdown></div>
            )}

            {section.type === "list_items" && section.portfolio_items && section.portfolio_items.length > 0 && (
              <>
                {section.title.toLowerCase().includes("experience") && ( <div className="mx-auto max-w-3xl">{section.portfolio_items.map(item => <ExperienceTimelineItem key={item.id} item={item} />)}</div> )}
                {section.title.toLowerCase().includes("project") && ( <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">{section.portfolio_items.map(item => <ProjectShowcaseCard key={item.id} item={item} />)}</div> )}
              </>
            )}
          </motion.section>
        ))}
      </main>
    </Layout>
  );
}