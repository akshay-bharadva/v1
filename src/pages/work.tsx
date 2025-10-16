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

// Reusable Project Card component, internal to this page
const ProjectShowcaseCard: React.FC<{ item: PortfolioItem }> = ({ item }) => (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-accent hover:-translate-y-1">
      {item.image_url && (<div className="relative aspect-video w-full overflow-hidden border-b border-white/10"><img src={item.image_url} alt={`Cover for ${item.title}`} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"/></div>)}
      <div className="flex grow flex-col p-6">
        <h3 className="mb-1 text-xl font-bold text-slate-100 transition-colors group-hover:text-accent">{item.title}</h3>
        {item.subtitle && (<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.subtitle}</p>)}
        {item.description && (<div className="prose prose-invert prose-sm mb-4 max-w-none flex-grow text-slate-400 line-clamp-3"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{item.description}</ReactMarkdown></div>)}
        <div className="mt-auto">
            {item.link_url && (<Link href={item.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-accent underline-offset-4 hover:underline">View Project <BsArrowUpRight className="ml-1.5" /></Link>)}
        </div>
      </div>
    </div>
);

export default function WorkPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `My Work | ${siteConfig.title}`;
  const pageDescription = "A curated gallery of projects by Akshay Bharadva, showcasing skills in web development and design.";
  const pageUrl = `${siteConfig.url}/work/`;

  const [projectSection, setProjectSection] = useState<PortfolioSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sectionsData = await fetchPortfolioSectionsWithItems();
        // Find the first section with "project" in its title (case-insensitive)
        const projects = sectionsData.find(s => s.title.toLowerCase().includes("project"));
        setProjectSection(projects || null);
      } catch (e: any) { setError(e.message || "Failed to load projects."); }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

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
          <h1 className="text-5xl font-black text-slate-100 md:text-6xl">My Work</h1>
          <p className="mt-4 text-xl text-slate-400">A selection of projects that I'm proud of.</p>
        </motion.header>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="mb-4 w-10 h-10 animate-spin rounded-full border-4 border-accent border-l-transparent"></div>
             <p className="text-lg font-bold text-slate-300">Loading Projects...</p>
          </div>
        )}
        {error && <p className="py-8 text-center text-red-400">Error: {error}</p>}
        
        {!isLoading && !error && (!projectSection || !projectSection.portfolio_items || projectSection.portfolio_items.length === 0) && (
            <div className="text-center border border-dashed border-zinc-700 p-12">
                <h3 className="text-xl font-bold text-slate-300">Projects Coming Soon</h3>
                <p className="text-zinc-400">I'm currently preparing a showcase of my work. Please check back later!</p>
            </div>
        )}

        {!isLoading && projectSection?.portfolio_items && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projectSection.portfolio_items.map(item => (
              <motion.div key={item.id} variants={itemVariants}>
                <ProjectShowcaseCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}