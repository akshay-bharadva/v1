/*
This file has been redesigned to align with the new kinetic typography theme.
- All custom styling classes are removed and replaced with redesigned UI components (`Button`, `Input`, `Select`, `Card`, `Table`, `Badge`, `DropdownMenu`).
- The main layout is cleaner, using standard headings and a filter section.
- The list of posts is now displayed in a `Table` component for better organization and readability on larger screens.
- Actions for each post (Publish, Edit, Delete) are consolidated into a `DropdownMenu` to save space and provide a cleaner row layout.
- Loading and empty states have been updated to match the minimalist aesthetic.
*/
"use-client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    let query = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

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

  useEffect(() => { loadPosts(); }, [filterStatus, searchTerm]);
  useEffect(() => { if (startInCreateMode) { handleCreatePost(); onActionHandled?.(); } }, [startInCreateMode, onActionHandled]);

  const handleCreatePost = () => { setIsCreating(true); setEditingPost(null); };
  const handleEditPost = (post: BlogPost) => { setEditingPost(post); setIsCreating(false); };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    setIsLoading(true);
    const postToDelete = posts.find((p) => p.id === postId);

    if (postToDelete?.cover_image_url && postToDelete.cover_image_url.includes(supabaseUrl)) {
      const pathSegments = postToDelete.cover_image_url.split("/");
      const imagePath = pathSegments.slice(pathSegments.indexOf(bucketName) + 1).join("/");
      if (imagePath.startsWith("blog_images/")) {
        try { await supabase.storage.from(bucketName).remove([imagePath]); }
        catch (storageError) { console.error("Failed to delete cover image:", storageError); }
      }
    }

    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", postId);
    if (deleteError) setError("Failed to delete post: " + deleteError.message);
    else await loadPosts();
    setIsLoading(false);
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, updated_at, ...dataToSave } = postData;

    let response;
    if (isCreating || !editingPost?.id) {
      response = await supabase.from("blog_posts").insert(dataToSave).select().single();
    } else {
      response = await supabase.from("blog_posts").update(dataToSave).eq("id", editingPost.id).select().single();
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

  const handleCancel = () => { setIsCreating(false); setEditingPost(null); setError(null); };

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    setIsLoading(true);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase.from("blog_posts").update({ published: newStatus, published_at: newStatus ? new Date().toISOString() : null }).eq("id", postId);
    if (updateError) setError("Failed to update status: " + updateError.message);
    else await loadPosts();
    setIsLoading(false);
  };

  if (isCreating || editingPost) {
    return <BlogEditor post={editingPost} onSave={handleSavePost} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-muted-foreground">Manage your blog content.</p>
        </div>
        <Button onClick={handleCreatePost}><PlusCircle className="mr-2 size-4" /> Create New Post</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input placeholder="Search posts by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
        <Select value={filterStatus} onValueChange={(value: "all" | "published" | "draft") => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-6 text-center text-muted-foreground"> <Loader2 className="mx-auto size-6 animate-spin" /> </div>}
          {!isLoading && error && <div className="p-6 text-center text-destructive">{error}</div>}
          {!isLoading && !error && posts.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold">No posts found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or create a new post.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={post.published ? "default" : "secondary"} className={post.published ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" : ""}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(post.created_at || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => togglePostStatus(post.id, post.published || false)}>
                            {post.published ? <ToggleLeft className="mr-2 size-4" /> : <ToggleRight className="mr-2 size-4" />}
                            <span>{post.published ? "Unpublish" : "Publish"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPost(post)}><Edit className="mr-2 size-4" /><span>Edit</span></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePost(post.id)}><Trash className="mr-2 size-4" /><span>Delete</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}