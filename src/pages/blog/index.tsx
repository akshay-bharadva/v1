/*
This file is redesigned for the kinetic typography theme.
- The heavy, neo-brutalist styles for the header and post cards are replaced with a clean, modern, and minimalist design.
- The page header is simplified with modern typography.
- Post cards are now built using the redesigned `Card` component, featuring a cleaner layout, hover effects, and better typographic hierarchy.
- Metadata (date, views, read time) is presented more elegantly.
- The empty/loading states are updated to match the new aesthetic.
*/
import Link from "next/link";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const calculateReadTime = (content: string = ""): number => {
  const wordsPerMinute = 225;
  const textLength = content.split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(textLength / wordsPerMinute);
  return time;
};

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (fetchError) throw new Error(fetchError.message);
        setPosts(data || []);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 font-medium text-destructive">
            Error loading posts: {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{`Blog | ${siteConfig.title}`}</title>
        <meta name="description" content={`Articles and thoughts from ${siteConfig.author}.`} />
        <meta property="og:title" content={`Blog | ${siteConfig.title}`} />
        <meta property="og:description" content={`Articles and thoughts from ${siteConfig.author}.`} />
        <meta property="og:url" content={`${siteConfig.url}/blog/`} />
        <link rel="canonical" href={`${siteConfig.url}/blog/`} />
      </Head>
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b border-border pb-8 text-center"
        >
          <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl">
            The Blog
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A collection of articles on web development, design, and technology.
          </p>
        </motion.header>

        {posts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="py-16 text-center"
          >
            <h3 className="text-2xl font-bold">No Posts Yet</h3>
            <p className="text-muted-foreground">Check back soon for new articles.</p>
          </motion.div>
        )}

        <motion.div
          className="space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => {
            const readTime = calculateReadTime(post.content || "");
            return (
              <motion.section key={post.id} variants={itemVariants} role="article">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                >
                  <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 transition-colors hover:bg-secondary/50">
                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
                      <div className="flex-1">
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent md:text-3xl">
                          {post.title}
                        </h2>
                        <p className="font-medium leading-relaxed text-muted-foreground">
                          {post.excerpt || "Click to read more..."}
                        </p>
                      </div>
                      {post.cover_image_url && (
                        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md border bg-secondary sm:h-24 sm:w-36">
                          <img
                            src={post.cover_image_url}
                            alt={`Cover image for ${post.title}`}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <time dateTime={post.published_at || post.created_at || ""}>
                        {formatDate(post.published_at || post.created_at || new Date())}
                      </time>
                      <span className="flex items-center gap-1.5"><Clock className="size-3" /> {readTime} min read</span>
                      {typeof post.views === "number" && (
                        <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {post.views} views</span>
                      )}
                      {post.tags && post.tags[0] && <Badge variant="outline">{post.tags[0]}</Badge>}
                    </div>
                  </div>
                </Link>
              </motion.section>
            );
          })}
        </motion.div>
      </main>
    </Layout>
  );
}