// This component is updated to match the dark admin theme.
// - All hard-coded style classes are replaced with simpler, theme-consistent ones.
// - The `font-space` class is replaced with the default `font-sans`.
// - All functionality for editing posts remains identical.

"use client";
import type React from "react";
import { useState, useEffect, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import type { BlogPost } from "@/types";
import AdvancedMarkdownEditor from "@/components/admin/AdvancedMarkdownEditor";
import { supabase } from "@/supabase/client";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button"; // Using UI components for consistency
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}

const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
const initialFormData = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
    cover_image_url: "",
    internal_notes: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        tags: post.tags?.join(", ") || "",
        published: post.published ?? false,
        cover_image_url: post.cover_image_url || "",
        internal_notes: post.internal_notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !prev.slug || !post?.id ? generateSlug(title) : prev.slug,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must be lowercase, alphanumeric, with single hyphens.";
    }
    if (!formData.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const postDataToSave: Partial<BlogPost> = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published: formData.published,
      cover_image_url: formData.cover_image_url || null,
      internal_notes: formData.internal_notes || null
    };
    await onSave(postDataToSave);
    setIsSaving(false);
  };

  const handleImageUpload = async (
    file: File,
    forCoverImage: boolean = false,
  ) => {
    if (!file) return;
    setIsUploading(true);
    setErrors((prev) => ({ ...prev, image_upload: "" }));

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8,
    };

    let compressedFile = file;
    try {
      const canvas = document.createElement("canvas");
      if (!(canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0)) {
        options.fileType = file.type;
      }
      compressedFile = await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression error:", error);
      setErrors((prev) => ({
        ...prev,
        image_upload: "Image compression failed. Trying original.",
      }));
    }

    const fileName = `${Date.now()}_${compressedFile.name.replace(/\s+/g, "_")}`;
    const filePath = `blog_images/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, compressedFile);

    setIsUploading(false);
    if (uploadError) {
      setErrors((prev) => ({
        ...prev,
        image_upload: "Upload failed: " + uploadError.message,
      }));
      return;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    const imageUrl = urlData.publicUrl;

    if (forCoverImage) {
      setFormData((prev) => ({ ...prev, cover_image_url: imageUrl }));
    } else {
      const imageMarkdown = `\n![${compressedFile.name.split(".")[0] || "image"}](${imageUrl})\n`;
      setFormData((prev) => ({
        ...prev,
        content: prev.content + imageMarkdown,
      }));
    }
  };

  const onFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
    forCoverImage: boolean,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file, forCoverImage);
    }
    if (event.target) event.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl font-sans"
    >
      <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
        <div className="border-b border-zinc-700 bg-zinc-900/50 px-4 py-4 sm:px-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-100">{post?.id ? "Edit Post" : "Create New Post"}</h2>
            <div className="flex items-center space-x-2">
              <Checkbox id="published" checked={formData.published} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: !!checked }))} />
              <Label htmlFor="published" className="text-sm font-semibold text-slate-200">Published</Label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <Label htmlFor="title" className="mb-1 block text-sm font-bold text-slate-200">Title *</Label>
                <Input type="text" id="title" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} className={errors.title ? "border-red-500" : ""} />
                {errors.title && <p className="mt-1 text-xs font-semibold text-red-400">{errors.title}</p>}
              </div>

              <div>
                <Label className="mb-1 block text-sm font-bold text-slate-200">Content (Markdown) *</Label>
                <AdvancedMarkdownEditor value={formData.content} onChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))} onImageUploadRequest={() => fileInputRef.current?.click()} minHeight="400px" />
                <input type="file" ref={fileInputRef} onChange={(e) => onFileSelected(e, false)} accept="image/*" className="hidden" id="content_image_file_input" />
                {errors.content && <p className="mt-1 text-xs font-semibold text-red-400">{errors.content}</p>}
                {errors.image_upload && <p className="mt-1 text-xs font-semibold text-red-400">{errors.image_upload}</p>}
                {isUploading && <p className="text-sm font-semibold text-blue-400">Uploading image...</p>}
              </div>
              <div>
                <Label htmlFor="internal_notes" className="mb-1 block text-sm font-bold text-slate-200">Internal Notes (Admin only)</Label>
                <Textarea id="internal_notes" rows={3} value={formData.internal_notes} onChange={(e) => setFormData((prev) => ({ ...prev, internal_notes: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-6 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
              <div>
                <Label htmlFor="slug" className="mb-1 block text-sm font-bold text-slate-200">Slug *</Label>
                <Input type="text" id="slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-") }))} className={errors.slug ? "border-red-500" : ""} />
                {errors.slug && <p className="mt-1 text-xs font-semibold text-red-400">{errors.slug}</p>}
              </div>
              <div>
                <Label htmlFor="excerpt" className="mb-1 block text-sm font-bold text-slate-200">Excerpt (Short summary)</Label>
                <Textarea id="excerpt" rows={3} value={formData.excerpt} onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="tags" className="mb-1 block text-sm font-bold text-slate-200">Tags (comma-separated)</Label>
                <Input type="text" id="tags" value={formData.tags} onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="cover_image_url_display" className="mb-1 block text-sm font-bold text-slate-200">Cover Image</Label>
                <Input type="text" id="cover_image_url_display" value={formData.cover_image_url} onChange={(e) => setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))} className="mb-2" placeholder="Paste image URL or upload" />
                <Input type="file" id="cover_image_file_input" ref={coverImageFileInputRef} accept="image/*" onChange={(e) => onFileSelected(e, true)} />
                {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover preview" className="mt-2 max-h-40 w-full rounded-md border border-zinc-600 object-contain" />}
                {errors.cover_image_url && <p className="mt-1 text-xs font-semibold text-red-400">{errors.cover_image_url}</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-end gap-3 border-t border-zinc-700 pt-6 sm:flex-row sm:space-x-3">
            <Button type="button" onClick={onCancel} variant="secondary" disabled={isSaving || isUploading}>Cancel</Button>
            <Button type="submit" disabled={isSaving || isUploading || !formData.title || !formData.slug || !formData.content}>
              {isSaving ? "Saving..." : isUploading ? "Processing Image..." : post?.id ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}