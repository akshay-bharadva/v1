/*
This file is heavily redesigned to fit the new theme.
- All custom CSS classes are replaced with the redesigned UI components (`Button`, `Input`, `Textarea`, `Select`, `Card`).
- The structure is now based on nested `Card` components, providing a clean hierarchy for sections and their items.
- Section and item forms are now rendered within a `Card` with a distinct background for better visual separation.
- The drag-and-drop handle (`GripVertical`) is retained but styled to be more subtle.
- Action buttons are now consistent `Button` components from the UI kit.
*/
"use client";

import { useState, useEffect, FormEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ContentManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function ContentManager({ startInCreateMode, onActionHandled }: ContentManagerProps) {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreatingItemInSection, setIsCreatingItemInSection] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => { e.dataTransfer.effectAllowed = 'move'; setDraggedSectionId(sectionId); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetSection: PortfolioSection) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetSection.id) return;
    const currentSections = [...sections];
    const draggedIndex = currentSections.findIndex(s => s.id === draggedSectionId);
    const targetIndex = currentSections.findIndex(s => s.id === targetSection.id);
    const [draggedItem] = currentSections.splice(draggedIndex, 1);
    currentSections.splice(targetIndex, 0, draggedItem);
    setSections(currentSections);
    setDraggedSectionId(null);
    const sectionIdsInNewOrder = currentSections.map(s => s.id);
    const { error: rpcError } = await supabase.rpc('update_section_order', { section_ids: sectionIdsInNewOrder });
    if (rpcError) { setError("Failed to save new order: " + rpcError.message); await fetchPortfolioContent(); }
  };

  const fetchPortfolioContent = async () => {
    setIsLoading(true);
    setError(null);
    const { data: sectionsData, error: sectionsError } = await supabase.from("portfolio_sections").select(`*, portfolio_items (*)`).order("display_order", { ascending: true }).order("display_order", { foreignTable: "portfolio_items", ascending: true });
    if (sectionsError) { setError("Failed to load content: " + sectionsError.message); setSections([]); }
    else setSections(sectionsData || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchPortfolioContent(); }, []);
  useEffect(() => { if (startInCreateMode) { handleCreateNewSection(); onActionHandled?.(); } }, [startInCreateMode, onActionHandled]);

  const handleCreateNewSection = () => { setIsCreatingSection(true); setEditingSection(null); setEditingItem(null); setIsCreatingItemInSection(null); };

  const handleSaveSection = async (sectionData: Partial<PortfolioSection>) => {
    setIsLoading(true);
    setError(null);
    const { user_id, portfolio_items, id, ...saveData } = sectionData;
    const response = editingSection?.id ? await supabase.from("portfolio_sections").update(saveData).eq("id", editingSection.id).select().single() : await supabase.from("portfolio_sections").insert(saveData).select().single();
    if (response.error) setError("Failed to save section: " + response.error.message);
    else { setEditingSection(null); setIsCreatingSection(false); await fetchPortfolioContent(); }
    setIsLoading(false);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and ALL its items? This is irreversible.")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase.from("portfolio_sections").delete().eq("id", sectionId);
    if (deleteError) setError("Failed to delete section: " + deleteError.message);
    else await fetchPortfolioContent();
    setIsLoading(false);
  };

  const handleSaveItem = async (itemData: Partial<PortfolioItem>, sectionId: string) => {
    setIsLoading(true);
    setError(null);
    const { user_id, id, ...saveData } = itemData;
    const response = editingItem?.id ? await supabase.from("portfolio_items").update({ ...saveData, section_id: sectionId }).eq("id", editingItem.id).select().single() : await supabase.from("portfolio_items").insert({ ...saveData, section_id: sectionId }).select().single();
    if (response.error) setError("Failed to save item: " + response.error.message);
    else { setEditingItem(null); setIsCreatingItemInSection(null); await fetchPortfolioContent(); }
    setIsLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item? This is irreversible.")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase.from("portfolio_items").delete().eq("id", itemId);
    if (deleteError) setError("Failed to delete item: " + deleteError.message);
    else await fetchPortfolioContent();
    setIsLoading(false);
  };

  if (isLoading && sections.length === 0 && !error) return <div className="p-4"><Loader2 className="animate-spin" /></div>;
  if (error && !editingItem && !editingSection) return <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Portfolio Content</h2><p className="text-muted-foreground">Manage sections and items on your showcase page.</p></div>
        <Button onClick={handleCreateNewSection}><Plus className="mr-2 size-4" /> Add Section</Button>
      </div>
      <Separator className="my-6" />

      {(isCreatingSection || editingSection) && (
        <Card className="mb-6 bg-secondary/50">
          <CardHeader><CardTitle className="text-lg">{editingSection ? `Edit Section: ${editingSection.title}` : "Create New Section"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const data: Partial<PortfolioSection> = { title: formData.get("section_title") as string, type: formData.get("section_type") as PortfolioSection["type"], content: (formData.get("section_content") as string) || null, display_order: parseInt(formData.get("section_display_order") as string) || 0, }; handleSaveSection(data); }} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="section_title">Title</Label><Input id="section_title" name="section_title" defaultValue={editingSection?.title || ""} required /></div><div className="space-y-2"><Label htmlFor="section_type">Type</Label><Select name="section_type" defaultValue={editingSection?.type || "markdown"} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="markdown">Markdown</SelectItem><SelectItem value="list_items">List of Items</SelectItem></SelectContent></Select></div></div>
              <div className="space-y-2"><Label htmlFor="section_content">Content (for Markdown type)</Label><Textarea id="section_content" name="section_content" defaultValue={editingSection?.content || ""} rows={4} /></div>
              <div className="space-y-2"><Label htmlFor="section_display_order">Display Order</Label><Input id="section_display_order" type="number" name="section_display_order" defaultValue={editingSection?.display_order?.toString() || "0"} /></div>
              <div className="flex gap-2"><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 size-4 animate-spin"/>}Save Section</Button><Button type="button" variant="outline" onClick={() => { setIsCreatingSection(false); setEditingSection(null); }}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} draggable="true" onDragStart={(e) => handleDragStart(e, section.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, section)} className={`rounded-lg border bg-card transition-all duration-200 ${draggedSectionId === section.id ? 'opacity-50 scale-95' : 'opacity-100'}`}>
            <div className="flex items-start">
              <div className="p-3 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"><GripVertical className="size-5" /></div>
              <div className="flex-grow border-l border-border">
                <div className="flex flex-col items-start gap-2 border-b border-border p-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold">{section.title} <span className="ml-2 text-sm font-normal text-muted-foreground">(Type: {section.type}, Order: {section.display_order})</span></h3>
                  <div className="flex shrink-0 gap-2"><Button size="sm" variant="outline" onClick={() => { setEditingSection(section); setIsCreatingSection(false); setEditingItem(null); setIsCreatingItemInSection(null); }}><Edit className="mr-1.5 size-3.5" /> Edit</Button><Button size="sm" variant="destructive" onClick={() => handleDeleteSection(section.id)} disabled={isLoading}><Trash2 className="mr-1.5 size-3.5" /> Delete</Button></div>
                </div>
                <div className="p-4">
                  {section.type === "markdown" && <p className="text-sm text-muted-foreground">{section.content || <span className="italic">No content.</span>}</p>}
                  {section.type === "list_items" && (
                    <div className="space-y-4">
                      {section.portfolio_items && section.portfolio_items.map((item) => (
                        <div key={item.id} className="rounded-md border bg-secondary/30 p-3"><div className="flex items-start justify-between"><div className="flex-1"><p className="font-bold">{item.title}</p><p className="text-sm font-semibold text-accent">{item.subtitle}</p>{item.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}</div><div className="ml-2 shrink-0 space-x-1"><Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditingItem(item); setIsCreatingItemInSection(section.id); setEditingSection(null); setIsCreatingSection(false); }}><Edit className="size-3.5" /></Button><Button variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteItem(item.id)} disabled={isLoading}><Trash2 className="size-3.5" /></Button></div></div></div>
                      ))}
                      <Button size="sm" onClick={() => { setIsCreatingItemInSection(section.id); setEditingItem(null); setEditingSection(null); setIsCreatingSection(false); }}><Plus className="mr-2 size-4" /> Add Item</Button>
                    </div>
                  )}
                  {((isCreatingItemInSection === section.id && !editingItem) || (editingItem && editingItem.section_id === section.id)) && (
                    <div className="mt-4 border-t border-border pt-4"><h4 className="text-md mb-2 font-bold">{editingItem ? `Edit Item: ${editingItem.title}` : `Create Item in "${section.title}"`}</h4>
                      <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const data: Partial<PortfolioItem> = { title: formData.get("item_title") as string, subtitle: (formData.get("item_subtitle") as string) || null, description: (formData.get("item_description") as string) || null, link_url: (formData.get("item_link") as string) || null, image_url: (formData.get("item_image_url") as string) || null, tags: (formData.get("item_tags") as string)?.split(",").map((t) => t.trim()).filter((t) => t) || null, display_order: parseInt(formData.get("item_display_order") as string) || 0, internal_notes: (formData.get("item_internal_notes") as string) || null }; handleSaveItem(data, section.id); }} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Title *</Label><Input name="item_title" defaultValue={editingItem?.title || ""} required /></div><div className="space-y-1.5"><Label>Subtitle</Label><Input name="item_subtitle" defaultValue={editingItem?.subtitle || ""} /></div></div>
                        <div className="space-y-1.5"><Label>Description</Label><Textarea name="item_description" defaultValue={editingItem?.description || ""} rows={3} /></div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Link URL</Label><Input name="item_link" defaultValue={editingItem?.link_url || ""} /></div><div className="space-y-1.5"><Label>Image URL</Label><Input name="item_image_url" defaultValue={editingItem?.image_url || ""} /></div></div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input name="item_tags" defaultValue={editingItem?.tags?.join(", ") || ""} /></div><div className="space-y-1.5"><Label>Display Order</Label><Input type="number" name="item_display_order" defaultValue={editingItem?.display_order?.toString() || "0"} /></div></div>
                        <div className="space-y-1.5"><Label>Internal Notes</Label><Textarea name="item_internal_notes" defaultValue={editingItem?.internal_notes || ""} rows={2} /></div>
                        <div className="flex gap-2"><Button type="submit" size="sm" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 size-4 animate-spin"/>}Save Item</Button><Button type="button" size="sm" variant="outline" onClick={() => { setIsCreatingItemInSection(null); setEditingItem(null); }}>Cancel</Button></div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}