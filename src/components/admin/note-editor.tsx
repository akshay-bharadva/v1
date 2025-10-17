/*
This file is updated to align with the new kinetic typography design system.
- The layout is now built using standard UI components like `Card`, `Label`, `Input`, `Textarea`, and `Button`.
- Removed all custom styling classes and adopted the theme-aware design of the UI kit.
- The structure is cleaner, with a distinct header and a form body, improving visual hierarchy.
- The save/cancel actions are placed in a consistent footer position.
*/
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        content: note.content || "",
        tags: note.tags?.join(", ") || "",
      });
    } else {
      setFormData({ title: "", content: "", tags: "" });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    const noteDataToSave: Partial<Note> = {
      title: formData.title || null,
      content: formData.content || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    };
    await onSave(noteDataToSave);
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {note?.id ? "Edit Note" : "Create New Note"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="A title for your note"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Jot down your thoughts..."
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="idea, to-do, reminder"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin"/>}
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}