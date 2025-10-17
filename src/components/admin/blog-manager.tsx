"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import { supabase } from "@/supabase/client";
import { Button } from "../ui/button";
import { Edit, Loader2, MoreHorizontal, PlusCircle, ToggleLeft, ToggleRight, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const inputClass =
  "w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-space";
const selectClass =
  "px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-space";
const buttonPrimaryClass = (fullWidth = false) =>
  `bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-none font-bold border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 font-space ${fullWidth ? "w-full" : ""}`;
const buttonActionClass = (
  color: string,
  bgColorHover: string,
  textColor: string = "text-black",
) =>
  `px-3 py-1 rounded-none text-sm font-semibold border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all duration-100 font-space ${color} hover:${bgColorHover} ${textColor}`;

interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({
  startInCreateMode,
  onActionHandled,
}: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
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

  if (
    isLoading &&
    posts.length === 0 &&
    !isCreating &&
    !editingPost &&
    !error
  ) {
    return (
      <div className="p-4 font-space font-semibold text-black">
        Loading blog posts...
      </div>
    );
  }
  if (error && !isCreating && !editingPost) {
    return (
      <div className="rounded-none border-2 border-red-500 bg-red-100 p-4 font-space font-semibold text-red-700">
        {error}
      </div>
    );
  }

  if (isCreating || editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSavePost}
        onCancel={handleCancel}
      />
    );
  }

   return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-muted-foreground">Manage your blog content.</p>
        </div>
        <Button onClick={handleCreatePost}>
          <PlusCircle className="mr-2 size-4" /> Create New Post
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={filterStatus}
          onValueChange={(value: "all" | "published" | "draft") =>
            setFilterStatus(value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-6 text-center text-muted-foreground">
              {" "}
              <Loader2 className="mx-auto size-6 animate-spin" />{" "}
            </div>
          )}
          {!isLoading && error && (
            <div className="p-6 text-center text-destructive">{error}</div>
          )}
          {!isLoading && !error && posts.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold">No posts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or create a new post.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={post.published ? "default" : "secondary"}
                        className={
                          post.published
                            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                            : ""
                        }
                      >
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(post.created_at || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              togglePostStatus(post.id, post.published || false)
                            }
                          >
                            {post.published ? (
                              <ToggleLeft className="mr-2 size-4" />
                            ) : (
                              <ToggleRight className="mr-2 size-4" />
                            )}
                            <span>
                              {post.published ? "Unpublish" : "Publish"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="mr-2 size-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash className="mr-2 size-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
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
