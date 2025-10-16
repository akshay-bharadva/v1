// The blog index is redesigned to be a clean, elegant list.
// - The layout is updated to a single column list.
// - Neo-brutalist cards are replaced with subtle list items with hover effects.
// - Framer Motion is used for a staggered animation of the post list.

import Link from "next/link";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";

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
          .select("id, title, slug, excerpt, published_at, created_at, tags")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (fetchError) throw new Error(fetchError.message);
        setPosts(data || []);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

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
      <main className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black text-slate-100 md:text-6xl">
            The Blog
          </h1>
          <p className="mt-4 text-xl text-slate-400">
            A collection of articles on web development, design, and technology.
          </p>
        </motion.header>

        {loading && <p className="text-center text-slate-400">Loading articles...</p>}
        {error && <p className="text-center text-red-400">Error loading articles: {error}</p>}
        
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border-t border-white/10"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block border-b border-white/10 py-8 transition-colors hover:bg-white/5"
                >
                  <div className="flex flex-col justify-between md:flex-row md:items-center">
                    <h2 className="text-2xl font-bold text-slate-200 transition-colors group-hover:text-accent md:text-3xl">
                      {post.title}
                    </h2>
                    <time className="mt-2 text-sm text-slate-500 md:mt-0 md:text-right">
                      {formatDate(post.published_at || post.created_at || new Date())}
                    </time>
                  </div>
                  <p className="mt-3 text-slate-400 line-clamp-2">
                    {post.excerpt || "Click to read more..."}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}