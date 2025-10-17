import Link from "next/link";
import { supabase } from "@/supabase/client";
import type { BlogPost } from "@/types";
import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react"; // Import the Eye icon

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { site: siteConfig } = appConfig;

  useEffect(() => {
    const fetchPostsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching blog posts:", fetchError);
          setError(fetchError.message);
          setPosts([]);
        } else {
          setPosts(data || []);
        }
      } catch (e: any) {
        console.error("Unexpected error fetching posts:", e);
        setError(e.message || "An unexpected error occurred.");
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPostsData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-100 font-space">
          <div className="rounded-none border-2 border-black bg-white p-6 text-lg font-bold">
            Loading Blog...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-red-100 p-4 font-space">
          <div className="rounded-none border-2 border-red-500 bg-white p-6 font-semibold text-red-700">
            Error loading posts: {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 font-space">
        <Head>
          <title>{`Blog | ${siteConfig.title}`}</title>
          <meta
            name="description"
            content={`Articles and thoughts from ${siteConfig.author}.`}
          />
          <meta property="og:title" content={`Blog | ${siteConfig.title}`} />
          <meta
            property="og:description"
            content={`Articles and thoughts from ${siteConfig.author}.`}
          />
          <meta property="og:url" content={`${siteConfig.url}/blog/`} />
          <link rel="canonical" href={`${siteConfig.url}/blog/`} />
        </Head>
        <main className="mx-auto max-w-3xl px-4 py-12">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-3 text-5xl font-black tracking-widest text-black md:text-6xl">
              THE BLOG
            </h1>
            <p className="text-xl font-semibold text-gray-700">
              Raw thoughts. Sharp takes. No frills.
            </p>
            <hr className="mx-auto mt-8 w-full max-w-sm border-t-2 border-black" />
          </motion.header>

          {posts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-none border-2 border-black bg-yellow-100 p-8 py-16 text-center shadow-[6px_6px_0_#000]"
            >
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-none border-2 border-black bg-black text-5xl font-black text-yellow-300">
                  ?
                </div>
                <h3 className="mb-2 text-2xl font-bold text-black">
                  NO POSTS HERE. YET.
                </h3>
                <p className="font-medium text-gray-700">
                  The digital ink is still drying. Or maybe I'm just busy
                  coding.
                </p>
              </div>
            </motion.div>
          )}

          <div className="space-y-12">
            {posts.map((post, index) => (
              <motion.section
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                role="article"
                aria-labelledby={`post-title-${post.id}`}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block overflow-hidden rounded-none border-2 border-black bg-white shadow-[6px_6px_0px_#000] transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#4f46e5] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#4f46e5]"

                  // {/* className="group block rounded-none border-2 border-black bg-white transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 hover:border-indigo-600" */}
                >
                  {post.cover_image_url && (
                    <div className="relative h-48 w-full overflow-hidden border-b-2 border-black sm:h-64">
                      <img
                        src={post.cover_image_url}
                        alt={`Cover image for ${post.title}`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <h2
                      id={`post-title-${post.id}`}
                      className="mb-2 text-2xl font-black text-black transition-colors group-hover:text-indigo-700 md:text-3xl"
                    >
                      {post.title}
                    </h2>

                    <p className="mb-4 font-medium leading-relaxed text-gray-700">
                      {post.excerpt || "Click to read more..."}
                    </p>

                    <div className="flex flex-col items-start justify-between gap-3 text-sm font-semibold text-gray-600 sm:flex-row sm:items-center">
                      <time
                        dateTime={post.published_at || post.created_at || ""}
                      >
                        {formatDate(
                          post.published_at || post.created_at || new Date(),
                        )}
                      </time>
                      {typeof post.views === "number" && (
                        <span className="flex items-center gap-1.5">
                          <Eye className="size-4" />
                          {post.views} views
                        </span>
                      )}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-gray-200 pt-4">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-none border border-black bg-gray-100 px-2 py-1 text-xs font-bold text-black"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.section>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}