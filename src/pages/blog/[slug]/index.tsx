// The blog post page is completely redesigned for a premium reading experience.
// - Neo-brutalist styles are replaced with Tailwind's 'prose' with a custom dark theme.
// - Framer Motion animates the header and content blocks into view on scroll.
// - A new `ReadingProgressBar` component is added.
// - The code block styling is updated to be cleaner and more modern.
// - The layout is simplified to focus entirely on the content.

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import ReadingProgressBar from "@/components/reading-progress-bar"; // New Import

const NotFoundDisplay = () => (
  <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
    <Head><title>Post Not Found | Blog</title><meta name="robots" content="noindex" /></Head>
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
    >
      <h1 className="text-5xl font-black text-accent md:text-7xl">404</h1>
      <p className="mt-4 text-xl text-slate-300">The page you seek is lost in the digital ether.</p>
      <Link href="/blog" className="mt-8 inline-block text-lg font-bold text-accent underline-offset-4 hover:underline">
        Back to Blog
      </Link>
    </motion.div>
  </div>
);

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    if (slug && typeof slug === "string") {
      const fetchPostData = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: fetchError } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
          if (fetchError) {
            if (fetchError.code === "PGRST116") setPost(null); else setError(fetchError.message);
          } else setPost(data);
        } catch (e: any) { setError(e.message || "An unexpected error occurred"); }
        setLoading(false);
      };
      fetchPostData();
    } else if (router.isReady && !slug) {
      setLoading(false);
      setPost(null);
    }
  }, [slug, router.isReady]);

  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production") {
      const incrementViewCount = async () => {
        try { await supabase.rpc("increment_blog_post_view", { post_id_to_increment: post.id }); }
        catch (rpcError) { console.error("Failed to increment view count", rpcError); }
      };
      const timeoutId = setTimeout(incrementViewCount, 5000); // Wait 5s to count as a 'view'
      return () => clearTimeout(timeoutId);
    }
  }, [post?.id]);

  if (loading) { return <Layout><div className="flex min-h-screen items-center justify-center text-lg font-bold">Loading Post...</div></Layout>; }
  if (error) { return <Layout><div className="flex min-h-screen items-center justify-center p-4 text-red-400">Error: {error}. <Link href="/blog" className="underline hover:text-accent">Back to blog</Link></div></Layout>; }
  if (!post) { return <Layout><NotFoundDisplay /></Layout>; }

  const postUrl = `${siteConfig.url}/blog/${post.slug}/`;
  const metaDescription = post.excerpt || post.title.substring(0, 160);

  return (
    <Layout>
      <Head>
        <title>{`${post.title} | ${siteConfig.title}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={postUrl} />
        {post.cover_image_url ? (<><meta property="og:image" content={post.cover_image_url} /><meta name="twitter:image" content={post.cover_image_url} /></>) : (<><meta property="og:image" content={siteConfig.defaultOgImage} /><meta name="twitter:image" content={siteConfig.defaultOgImage} /></>)}
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={postUrl} />
      </Head>

      <ReadingProgressBar />

      <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="mb-4 text-sm font-medium text-slate-400">
            <span>{formatDate(post.published_at || post.created_at || new Date())}</span>
            <span className="mx-2">&middot;</span>
            <span>{post.views || 0} views</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-slate-100 md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-6 text-lg text-slate-400 md:text-xl">{post.excerpt}</p>}
        </motion.header>

        {post.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="my-12"
          >
            <img src={post.cover_image_url} alt={post.title} className="w-full h-auto rounded-lg object-cover" />
          </motion.div>
        )}
        
        {post.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="prose prose-lg prose-invert mx-auto max-w-none prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-md prose-pre:border prose-pre:border-white/10"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {post.content}
            </ReactMarkdown>
          </motion.div>
        )}

        {post.tags && post.tags.length > 0 && (
          <motion.footer 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="mt-16 border-t border-white/10 pt-8"
          >
            <div className="flex flex-wrap gap-3">
              {post.tags.map(tag => (
                <Link href={`/blog/tags/${tag}`} key={tag} className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-accent hover:text-accent-foreground">
                  #{tag}
                </Link>
              ))}
            </div>
          </motion.footer>
        )}

      </article>
    </Layout>
  );
}