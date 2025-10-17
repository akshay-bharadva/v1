import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Calendar, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Markdown components (styling for the article body)
const markdownComponents: any = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <div className="my-6 overflow-hidden rounded-none border-2 border-black font-space bg-gray-800 shadow-[4px_4px_0_#000]">
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-3 py-1.5 font-mono text-xs text-gray-300">
          <span>{match[1].toUpperCase()}</span>
          <button
            onClick={() => navigator.clipboard.writeText(String(children))}
            className="rounded-none border border-gray-600 bg-gray-700 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-600"
            aria-label="Copy code to clipboard"
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
        {/* <SyntaxHighlighter 
          style={dark}
          language={match[1]}
          PreTag="div" // Use div to avoid pre-within-pre issues
          className="!m-0 !p-4 !bg-transparent overflow-x-auto font-mono text-sm"
          showLineNumbers
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter > */}
      </div>
    ) : (
      <code
        className={`${className || ""} rounded-none border border-black bg-yellow-200 px-1 py-0.5 font-mono text-sm text-black`}
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ node, ...props }: any) => (
    <img
      {...props}
      loading="lazy"
      className="my-8 h-auto max-h-[80vh] w-full rounded-none border-2 border-black object-contain shadow-[4px_4px_0_#000]"
      alt={props.alt || "Blog image"}
    />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="my-6 rounded-none border-l-4 border-black bg-gray-100 px-4 py-3 font-space italic text-black"
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      className="mb-4 mt-8 border-b-2 border-black pb-2 font-space text-2xl font-black text-black sm:text-3xl"
      {...props}
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      className="mb-3 mt-6 font-space text-xl font-bold text-black sm:text-2xl"
      {...props}
    />
  ),
  p: ({ node, ...props }: any) => (
    <p
      className="mb-6 font-space text-base leading-relaxed text-gray-800"
      {...props}
    />
  ),
  ul: ({ node, ...props }: any) => (
    <ul
      className="mb-6 list-inside list-disc space-y-2 pl-4 font-space text-gray-800"
      {...props}
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      className="mb-6 list-inside list-decimal space-y-2 pl-4 font-space text-gray-800"
      {...props}
    />
  ),
  li: ({ node, ...props }: any) => (
    <li className="mb-2 font-space leading-relaxed" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a
      className="font-space font-bold text-indigo-700 underline transition-colors hover:bg-yellow-200 hover:text-indigo-900"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  table: ({ node, ...props }: any) => (
    <div className="my-6 overflow-x-auto rounded-none border-2 border-black font-space shadow-[4px_4px_0_#000]">
      <table className="min-w-full border-collapse bg-white" {...props} />
    </div>
  ),
  th: ({ node, ...props }: any) => (
    <th
      className="border border-gray-500 bg-black px-4 py-2 text-left font-space font-bold text-white"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border border-gray-400 px-4 py-2 font-space" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-10 border-t-2 border-black" {...props} />
  ),
};

const PostHeader = ({ post }: { post: BlogPost }) => (
  <header className="mb-10 font-space">
    <h1 className="mb-4 text-2xl font-black leading-tight text-black md:text-3xl lg:text-4xl">
      {post.title}
    </h1>
    {post.excerpt && (
      <p className="mt-4 text-lg leading-relaxed text-gray-600 md:text-xl">
        {post.excerpt}
      </p>
    )}
  </header>
);

const AuthorInfo = ({ author, postDate, views }: { author: string; postDate: string | Date; views: number }) => (
  <div className="flex items-center gap-3">
    {/* <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/52954931?v=4" alt={author} />
      <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar> */}
    <div className="text-sm">
      <p className="font-bold text-black">{author}</p>
      <div className="flex items-center gap-2 text-gray-500">
        <time dateTime={new Date(postDate).toISOString()}>
          {formatDate(postDate, { month: 'short', day: 'numeric' })}
        </time>
        <span>·</span>
        <span>{views} views</span>
      </div>
    </div>
  </div>
);

const PostContent = ({ content }: { content: string }) => (
  <div className="prose prose-nb max-w-none font-space text-black">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const PostTagsSidebar = ({ tags }: { tags: string[] }) => (
  <div>
    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black">Tags</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          href={`/blog/tags/${encodeURIComponent(tag.toLowerCase())}`}
          key={tag}
          className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 hover:text-black"
        >
          {tag}
        </Link>
      ))}
    </div>
  </div>
);


const NotFoundDisplay = () => (
  <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-yellow-100 p-4 font-space">
    <Head><title>Post Not Found | Blog</title><meta name="robots" content="noindex" /></Head>
    <div className="rounded-none border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0_#000] sm:p-12">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-none border-2 border-black bg-red-500 text-4xl font-black text-white">!</div>
      <h1 className="mb-2 text-3xl font-black text-black">404 - Post Not Found</h1>
      <p className="mb-8 text-lg text-gray-700">The page you seek is lost in the digital ether.</p>
      <Link href="/blog" className="inline-flex items-center rounded-none border-2 border-black bg-black px-6 py-3 font-bold text-white shadow-[4px_4px_0px_#333] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-gray-800 hover:shadow-[2px_2px_0px_#333] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">Back to Blog</Link>
    </div>
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
      const timeoutId = setTimeout(incrementViewCount, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [post?.id]);

  if (loading) { return <Layout><div className="flex min-h-screen items-center justify-center bg-gray-100 font-space"><div className="rounded-none border-2 border-black bg-white p-6 text-lg font-bold">Loading Post...</div></div></Layout>; }
  if (error) { return <Layout><div className="flex min-h-screen items-center justify-center bg-red-100 p-4 font-space"><div className="rounded-none border-2 border-red-500 bg-white p-6 font-semibold text-red-700">Error: {error}. <Link href="/blog" className="underline hover:text-black">Back to blog</Link></div></div></Layout>; }
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

      <main className="bg-white py-8 font-space md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">

            <article className="lg:col-span-9">
              <PostHeader post={post} />
              <hr className="my-8 border-gray-200" />
              {post.cover_image_url && (
                <div className="my-8">
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-auto rounded-none border-2 border-black object-cover" />
                </div>
              )}
              {post.content && <PostContent content={post.content} />}
            </article>

            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <AuthorInfo author={siteConfig.author} postDate={post.published_at || post.created_at || new Date()} views={post.views || 0} />
                {post.tags && post.tags.length > 0 && <PostTagsSidebar tags={post.tags} />}
              </div>
            </aside>

          </div>
        </motion.div>
      </main>
    </Layout>
  );
}