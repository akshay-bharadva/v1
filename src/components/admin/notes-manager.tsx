// This component has been fully restyled for the dark admin theme.
// - Note cards are now dark with subtle borders and hover effects.
// - The pinned state has a new visual style.
// - All functionality remains identical.

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import NoteEditor from "@/components/admin/note-editor";
import { supabase } from "@/supabase/client";
import { Pin, PinOff, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load notes: " + fetchError.message);
      setNotes([]);
    } else {
      setNotes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);
    if (deleteError) {
      setError("Failed to delete note: " + deleteError.message);
    } else {
      await loadNotes();
    }
    setIsLoading(false);
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    setIsLoading(true);
    setError(null);
    const { id, user_id, created_at, ...dataToSave } = noteData;

    let response;
    if (isCreating || !editingNote?.id) {
      response = await supabase.from("notes").insert(dataToSave).select().single();
    } else {
      response = await supabase
        .from("notes")
        .update(dataToSave)
        .eq("id", editingNote.id)
        .select()
        .single();
    }

    if (response.error) {
      setError("Failed to save note: " + response.error.message);
      setIsLoading(false);
      return;
    }

    setIsCreating(false);
    setEditingNote(null);
    await loadNotes();
  };

  const handleTogglePin = async (note: Note) => {
    setIsLoading(true);
    const { error: pinError } = await supabase
      .from("notes")
      .update({ is_pinned: !note.is_pinned })
      .eq("id", note.id);
    if (pinError) {
      setError("Failed to update pin status: " + pinError.message);
    } else {
      await loadNotes();
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
    setError(null);
  };

  if (isCreating || editingNote) {
    return <NoteEditor note={editingNote} onSave={handleSaveNote} onCancel={handleCancel} />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Personal Notes</h2>
          <p className="text-zinc-400">A space for your thoughts and reminders.</p>
        </div>
        <Button onClick={handleCreateNote}>+ Create New Note</Button>
      </div>

      {isLoading && <p className="font-semibold text-slate-200">Loading notes...</p>}
      {error && <div className="rounded-md border border-red-500/30 bg-red-900/20 p-4 font-semibold text-red-300">{error}</div>}

      {!isLoading && notes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800 py-12 text-center">
          <h3 className="text-lg font-bold text-slate-100">No notes yet.</h3>
          <p className="text-zinc-400">Click "Create New Note" to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }} className={`flex flex-col rounded-lg border bg-zinc-900 transition-colors ${note.is_pinned ? "border-yellow-500/30" : "border-zinc-700"}`}
              >
                <div className="flex-grow p-4">
                  {note.title && <h3 className="mb-2 truncate text-lg font-bold text-slate-100">{note.title}</h3>}
                  <p className="line-clamp-4 text-sm text-zinc-400">{note.content || <span className="italic">No content.</span>}</p>
                </div>
                <div className="border-t border-zinc-700 p-3">
                  {note.tags && note.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {note.tags.map(tag => <span key={tag} className="inline-block rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-semibold text-zinc-300">{tag}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-500">
                      Updated: {new Date(note.updated_at || "").toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => handleTogglePin(note)} title={note.is_pinned ? "Unpin" : "Pin"}>{note.is_pinned ? <PinOff className="size-4 text-yellow-400" /> : <Pin className="size-4" />}</Button>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => handleEditNote(note)} title="Edit"><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-7 hover:bg-red-900/50 hover:text-red-300" onClick={() => handleDeleteNote(note.id)} title="Delete"><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}