/*
This file has been completely redesigned to align with the new kinetic typography theme.
- Removed all custom CSS classes (`inputClass`, `buttonPrimaryClass`, `buttonSecondaryClass`).
- Replaced all form elements with their corresponding redesigned UI components (`Input`, `Button`, `Label`, `Checkbox`, `Textarea`).
- The two-column layout is modernized using CSS Grid, with the right column for metadata now styled as a distinct `Card`.
- The 'Published' toggle is now a `Switch` component for a better user experience.
- Image upload inputs are simplified and styled consistently with the rest of the UI kit.
- The overall container is cleaner, using subtle borders and theme-based colors instead of heavy shadows.
*/
"use client";
import type React from "react";
import { useState, useEffect, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import type { BlogPost } from "@/types";
import AdvancedMarkdownEditor from "@/components/admin/AdvancedMarkdownEditor";
import { supabase } from "@/supabase/client";
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";

const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "blog-assets";

interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}

export default function BlogEditor({
  post,
  onSave,
  onCancel,
}: BlogEditorProps) {
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
      newErrors.slug = "Slug must be lowercase, alphanumeric, with single hyphens.";
    }
    if (!formData.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    const tagsArray = formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag);
    const postDataToSave: Partial<BlogPost> = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published: formData.published,
      cover_image_url: formData.cover_image_url || null,
      internal_notes: formData.internal_notes || null,
    };
    await onSave(postDataToSave);
    setIsSaving(false);
  };

  const handleImageUpload = async (file: File, forCoverImage: boolean = false) => {
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
      setErrors((prev) => ({ ...prev, image_upload: "Image compression failed. Trying original." }));
    }

    const fileName = `${Date.now()}_${compressedFile.name.replace(/\s+/g, "_")}`;
    const filePath = `blog_images/${fileName}`;

    const { data, error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, compressedFile);

    setIsUploading(false);
    if (uploadError) {
      setErrors((prev) => ({ ...prev, image_upload: "Upload failed: " + uploadError.message }));
      return;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    const imageUrl = urlData.publicUrl;

    if (forCoverImage) {
      setFormData((prev) => ({ ...prev, cover_image_url: imageUrl }));
    } else {
      const imageMarkdown = `\n![${compressedFile.name.split(".")[0] || "image"}](${imageUrl})\n`;
      setFormData((prev) => ({ ...prev, content: prev.content + imageMarkdown }));
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>, forCoverImage: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file, forCoverImage);
    }
    if (event.target) event.target.value = "";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-sans">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">
          {post?.id ? "Edit Post" : "Create New Post"}
        </h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="published-status"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: checked }))}
          />
          <Label htmlFor="published-status" className="font-semibold">
            {formData.published ? "Published" : "Draft"}
          </Label>
        </div>
      </div>
      <Separator className="my-6" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <Label htmlFor="title" className="mb-2 block">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>

            <div>
              <Label className="mb-2 block">Content (Markdown) *</Label>
              <AdvancedMarkdownEditor
                value={formData.content}
                onChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
                onImageUploadRequest={() => fileInputRef.current?.click()}
                minHeight="400px"
              />
              <input type="file" ref={fileInputRef} onChange={(e) => onFileSelected(e, false)} accept="image/*" className="hidden" />
              {errors.content && <p className="mt-1 text-xs text-destructive">{errors.content}</p>}
              {errors.image_upload && <p className="mt-1 text-xs text-destructive">{errors.image_upload}</p>}
              {isUploading && <p className="mt-2 text-sm text-muted-foreground">Uploading image...</p>}
            </div>
            <div>
              <Label htmlFor="internal_notes" className="mb-2 block">Internal Notes (Admin only)</Label>
              <Textarea
                id="internal_notes"
                rows={3}
                value={formData.internal_notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, internal_notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="slug" className="mb-2 block">Slug *</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-") }))}
                            className={errors.slug ? "border-destructive" : ""}
                        />
                        {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
                    </div>
                     <div>
                        <Label htmlFor="excerpt" className="mb-2 block">Excerpt (Short summary)</Label>
                        <Textarea id="excerpt" rows={3} value={formData.excerpt} onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))} />
                    </div>
                     <div>
                        <Label htmlFor="tags" className="mb-2 block">Tags (comma-separated)</Label>
                        <Input id="tags" value={formData.tags} onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))} />
                    </div>
                     <div>
                        <Label htmlFor="cover_image_url_display" className="mb-2 block">Cover Image</Label>
                        <Input
                            id="cover_image_url_display"
                            value={formData.cover_image_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))}
                            placeholder="Paste image URL or upload"
                            className="mb-2"
                        />
                        <Input id="cover_image_file_input" ref={coverImageFileInputRef} accept="image/*" onChange={(e) => onFileSelected(e, true)} type="file" />
                        {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover preview" className="mt-2 max-h-40 w-full rounded-md border border-border object-contain" />}
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading || !formData.title || !formData.slug || !formData.content}>
            {(isSaving || isUploading) && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSaving ? "Saving..." : isUploading ? "Uploading..." : post?.id ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}