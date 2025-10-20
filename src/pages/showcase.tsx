/*
This file is heavily redesigned for the kinetic typography theme.
- The page header is simplified with modern, bold typography.
- The various card types (`ExperienceTimelineItem`, `TechToolCard`, `ProjectShowcaseCard`) are all consolidated and redesigned using the versatile `Card` component from the UI kit.
- The complex logic for choosing a card type based on title is removed in favor of a more flexible and consistent presentation. All list items are now displayed in a clean grid of cards.
- The experience timeline's custom CSS `::after` is removed. Experience is now presented as a standard section of cards.
- Loading and empty states are updated to be minimal and consistent with the new theme.
- Markdown rendering is now handled by the `prose dark:prose-invert` classes for automatic theme support.
*/
import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { fetchPortfolioSectionsWithItems } from "@/lib/api";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ShowcaseItemCard: React.FC<{ item: PortfolioItem }> = ({ item }) => (
  <Card className="flex h-full flex-col transition-transform duration-200 hover:-translate-y-1">
    <CardHeader>
      {item.image_url && (
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border bg-secondary">
          <img src={item.image_url} alt={`${item.title} logo`} className="size-full object-cover" />
        </div>
      )}
      <CardTitle>{item.title}</CardTitle>
      {item.subtitle && <CardDescription>{item.subtitle}</CardDescription>}
    </CardHeader>
    <CardContent className="flex-grow">
      {item.description && (
        <div className="prose prose-sm dark:prose-invert text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
        </div>
      )}
    </CardContent>
    <CardFooter className="flex-col items-start gap-4">
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (<Badge key={tag} variant="secondary">{tag}</Badge>))}
        </div>
      )}
      {item.link_url && (
        <Button asChild variant="link" className="p-0 h-auto">
          <Link href={item.link_url} target="_blank" rel="noopener noreferrer">
            Learn More <BsArrowUpRight className="ml-1.5 size-3" />
          </Link>
        </Button>
      )}
    </CardFooter>
  </Card>
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
      } catch (e: any) {
        setError(e.message || "Failed to load showcase content.");
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return <Layout><div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex min-h-screen items-center justify-center p-4"><div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 font-medium text-destructive">Error: {error}</div></div></Layout>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

      <main className="py-12 md:py-16">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12 border-b border-border pb-8 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">My Showcase</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">A curated collection of my work, skills, and journey.</p>
        </motion.header>

        {sections.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center rounded-lg border-2 border-dashed border-border bg-card py-20">
            <h3 className="text-xl font-bold">Content Under Construction</h3>
            <p className="text-muted-foreground">This showcase is currently being polished. Check back soon!</p>
          </motion.div>
        )}

        <div className="space-y-16">
          {sections.map((section, sectionIndex) => (
            <motion.section key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * sectionIndex, duration: 0.4 }}>
              <h2 className="mb-8 text-3xl font-bold tracking-tight text-foreground">{section.title}</h2>
              
              {section.type === "markdown" && section.content && (
                <div className="prose dark:prose-invert max-w-none rounded-lg border bg-card p-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                </div>
              )}

              {section.type === "list_items" && section.portfolio_items && section.portfolio_items.length > 0 && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {section.portfolio_items.map(item => (
                    <motion.div variants={itemVariants} key={item.id}>
                      <ShowcaseItemCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.section>
          ))}
        </div>
      </main>
    </Layout>
  );
}