// This component's styling is updated to match the dark admin theme.
// - All hard-coded style classes are replaced with simpler, theme-consistent ones.
// - Backgrounds, borders, and text colors are updated.
// - The font is changed to 'font-sans' (Inter).
// - All functionality for managing blog posts remains identical.

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button"; // Using the UI component for consistency
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({ startInCreateMode, onActionHandled }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus === "published") query = query.eq("published", true);
    else if (filterStatus === "draft") query = query.eq("published", false);

    if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError("Failed to load posts: " + fetchError.message);
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    if (startInCreateMode) {
      handleCreatePost();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const handleCreatePost = () => {
    setIsCreating(true);
    setEditingPost(null);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    const postToDelete = posts.find((p) => p.id === postId);

    if (
      postToDelete?.cover_image_url &&
      postToDelete.cover_image_url.includes(supabaseUrl)
    ) {
      const pathSegments = postToDelete.cover_image_url.split("/");
      const imagePath = pathSegments
        .slice(pathSegments.indexOf(bucketName) + 1)
        .join("/");
      if (imagePath.startsWith("blog_images/")) {
        try {
          await supabase.storage.from(bucketName).remove([imagePath]);
        } catch (storageError) {
          console.error(
            "Failed to delete cover image from storage:",
            storageError,
          );
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);
    if (deleteError) {
      setError("Failed to delete post: " + deleteError.message);
    } else {
      await loadPosts();
    }
    setIsLoading(false);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, updated_at, ...dataToSave } = postData;

    let response;
    if (isCreating || !editingPost?.id) {
      response = await supabase
        .from("blog_posts")
        .insert(dataToSave)
        .select()
        .single();
    } else {
      response = await supabase
        .from("blog_posts")
        .update(dataToSave)
        .eq("id", editingPost.id)
        .select()
        .single();
    }

    if (response.error) {
      setError("Failed to save post: " + response.error.message);
      setIsLoading(false);
      return;
    }

    setIsCreating(false);
    setEditingPost(null);
    await loadPosts();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
    setError(null);
  };

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      })
      .eq("id", postId);

    if (updateError) {
      setError("Failed to update status: " + updateError.message);
    } else {
      await loadPosts();
    }
    setIsLoading(false);
  };
  

  if (isCreating || editingPost) {
    return <BlogEditor post={editingPost} onSave={handleSavePost} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Blog Posts</h2>
          <p className="text-zinc-400">Manage your blog content</p>
        </div>
        <Button onClick={handleCreatePost}>+ Create New Post</Button>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <p className="font-semibold text-slate-200">Fetching posts...</p>}
      {!isLoading && posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800 py-12 text-center">
          <div className="mb-4 text-6xl text-zinc-500">📝</div>
          <h3 className="mb-2 text-lg font-bold text-slate-100">No posts found</h3>
          <p className="text-zinc-400">Try adjusting your filters or create a new post.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
          <div className="divide-y divide-zinc-700">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-zinc-700/50 md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 md:mr-4">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="truncate text-lg font-bold text-slate-100" title={post.title}>{post.title}</h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${post.published ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>{post.published ? "Published" : "Draft"}</span>
                      </div>
                      <p className="mb-3 line-clamp-2 text-zinc-400">{post.excerpt || (<span className="italic">No excerpt.</span>)}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                        {post.created_at && <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>}
                        <span>Slug: /{post.slug}</span>
                        <span>Views: {post.views || 0}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.map((tag: string) => (<span key={tag} className="inline-flex items-center rounded-md bg-zinc-700 px-2 py-1 text-xs text-zinc-300">{tag}</span>))}
                        </div>
                      )}
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:space-x-2">
                      <Button onClick={() => togglePostStatus(post.id, post.published || false)} disabled={isLoading} size="sm" variant="secondary">{isLoading ? "..." : post.published ? "Unpublish" : "Publish"}</Button>
                      <Button onClick={() => handleEditPost(post)} disabled={isLoading} size="sm" variant="outline">Edit</Button>
                      <Button onClick={() => handleDeletePost(post.id)} disabled={isLoading} size="sm" variant="destructive">Delete</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}