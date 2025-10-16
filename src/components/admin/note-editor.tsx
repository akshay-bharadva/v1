// This form component is updated for the dark theme.
// - It now uses the themed <Input>, <Textarea>, and <Button> components for a consistent look.
// - All functionality remains identical.

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      className="mx-auto max-w-4xl font-sans"
    >
      <div className="rounded-lg border border-zinc-700 bg-zinc-800">
        <div className="border-b border-zinc-700 bg-zinc-900/50 px-4 py-4">
          <h2 className="text-xl font-bold text-slate-100">
            {note?.id ? "Edit Note" : "Create New Note"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <Label htmlFor="title" className="mb-1 block text-sm font-bold text-slate-200">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="A title for your note"
            />
          </div>
          <div>
            <Label htmlFor="content" className="mb-1 block text-sm font-bold text-slate-200">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Jot down your thoughts..."
              rows={10}
            />
          </div>
          <div>
            <Label htmlFor="tags" className="mb-1 block text-sm font-bold text-slate-200">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="idea, to-do, reminder"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-zinc-700 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Note"}</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}