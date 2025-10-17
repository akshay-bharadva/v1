"use client";

import { useState, useEffect, FormEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the core sections that power the site
const PREDEFINED_SECTIONS = [
  { title: "Experience", type: "list_items" },
  { title: "Projects", type: "list_items" },
  { title: "Services", type: "list_items" },
  { title: "Tech Stack", type: "list_items" },
  { title: "Tools", type: "list_items" },
] as const;

// Helper to get contextual labels for the item form
const getItemFormLabels = (sectionTitle: string) => {
  // ... (This helper function remains unchanged)
  const lowerCaseTitle = sectionTitle.toLowerCase();
  if (lowerCaseTitle.includes("experience")) {
    return {
      title: "Position / Job Title",
      subtitle: "Company & Date Range (e.g., SigNoz @ 2023 - Present)",
      link: "Company URL",
      tags: "Tech Stack (comma-separated)",
      description: "Job Description (Markdown supported)",
    };
  }
  if (lowerCaseTitle.includes("tech") || lowerCaseTitle.includes("tools")) {
    return {
      title: "Technology / Tool Name",
      subtitle: "Subtitle (Optional)",
      link: "Official Website URL",
      tags: "Tags (Optional, comma-separated)",
      description: "Short Description",
    };
  }
  return {
    title: "Item Title",
    subtitle: "Item Subtitle",
    link: "Link URL",
    tags: "Features or Tags (comma-separated)",
    description: "Description (Markdown supported)",
  };
};

export default function ContentManager() {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreatingItemInSection, setIsCreatingItemInSection] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  // --- Data Fetching and State ---
  const existingPredefinedTitles = sections.map(s => s.title);
  const availableSectionsToAdd = PREDEFINED_SECTIONS.filter(p => !existingPredefinedTitles.includes(p.title));

  // --- All handler functions (handleDragStart, handleDrop, etc.) remain the same ---
  const fetchPortfolioContent = async () => { /* ... no changes ... */ setIsLoading(true); setError(null); const { data: sectionsData, error: sectionsError } = await supabase.from("portfolio_sections").select(`*, portfolio_items (*)`).order("display_order", { ascending: true }).order("display_order", { foreignTable: "portfolio_items", ascending: true }); if (sectionsError) { setError("Failed to load portfolio content: " + sectionsError.message); setSections([]); } else { setSections(sectionsData || []); } setIsLoading(false); };
  useEffect(() => { fetchPortfolioContent(); }, []);
  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => { e.dataTransfer.effectAllowed = 'move'; setDraggedSectionId(sectionId); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetSection: PortfolioSection) => { e.preventDefault(); if (!draggedSectionId || draggedSectionId === targetSection.id) return; const currentSections = [...sections]; const draggedIndex = currentSections.findIndex(s => s.id === draggedSectionId); const targetIndex = currentSections.findIndex(s => s.id === targetSection.id); const [draggedItem] = currentSections.splice(draggedIndex, 1); currentSections.splice(targetIndex, 0, draggedItem); setSections(currentSections); setDraggedSectionId(null); const { error: rpcError } = await supabase.rpc('update_section_order', { section_ids: currentSections.map(s => s.id) }); if (rpcError) { setError("Failed to save new order: " + rpcError.message); await fetchPortfolioContent(); } };
  const handleDeleteItem = async (itemId: string) => { if (!confirm("Delete this item? This is irreversible.")) return; setIsLoading(true); const { error: deleteError } = await supabase.from("portfolio_items").delete().eq("id", itemId); if (deleteError) setError("Failed to delete item: " + deleteError.message); else await fetchPortfolioContent(); setIsLoading(false); };
  const handleSaveItem = async (itemData: Partial<PortfolioItem>, sectionId: string) => { setIsLoading(true); setError(null); const { user_id, id, ...saveData } = itemData; const response = editingItem?.id ? await supabase.from("portfolio_items").update({ ...saveData, section_id: sectionId }).eq("id", editingItem.id).select().single() : await supabase.from("portfolio_items").insert({ ...saveData, section_id: sectionId }).select().single(); if (response.error) setError("Failed to save item: " + response.error.message); else { setEditingItem(null); setIsCreatingItemInSection(null); await fetchPortfolioContent(); } setIsLoading(false); };

  // --- MODIFIED HANDLERS ---
  const handleCreateNewSection = (isCustom: boolean = true) => {
    setIsCreatingSection(true);
    setEditingSection(isCustom ? null : { id: '', title: '', type: 'markdown' }); // Pre-fill for custom
    setEditingItem(null);
    setIsCreatingItemInSection(null);
  };

  const handleCreatePredefinedSection = async (section: { title: string; type: PortfolioSection['type'] }) => {
    setIsLoading(true);
    const { error } = await supabase.from('portfolio_sections').insert({
      title: section.title,
      type: section.type,
      display_order: sections.length + 1,
    });
    if (error) {
      setError(`Failed to create section "${section.title}": ${error.message}`);
    } else {
      await fetchPortfolioContent();
    }
    setIsLoading(false);
  }

  const handleSaveSection = async (sectionData: Partial<PortfolioSection>) => {
    setIsLoading(true);
    setError(null);
    const { user_id, portfolio_items, id, ...saveData } = sectionData;
    const response = editingSection?.id ? await supabase.from("portfolio_sections").update(saveData).eq("id", editingSection.id).select().single() : await supabase.from("portfolio_sections").insert(saveData).select().single();
    if (response.error) setError("Failed to save section: " + response.error.message);
    else { setEditingSection(null); setIsCreatingSection(false); await fetchPortfolioContent(); }
    setIsLoading(false);
  };

  const handleDeleteSection = async (sectionId: string, isPredefined: boolean) => {
    if (isPredefined) {
      alert("This is a core section and cannot be deleted to prevent breaking the website. You can edit its items instead.");
      return;
    }
    if (!confirm("Delete this custom section and ALL its items? This is irreversible.")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase.from("portfolio_sections").delete().eq("id", sectionId);
    if (deleteError) setError("Failed to delete section: " + deleteError.message);
    else await fetchPortfolioContent();
    setIsLoading(false);
  };

  const currentSectionForForm = sections.find(s => s.id === isCreatingItemInSection);
  const formLabels = currentSectionForForm ? getItemFormLabels(currentSectionForForm.title) : getItemFormLabels('');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto font-sans">
      <div className="rounded-lg border border-zinc-700 bg-zinc-800">
        <div className="flex flex-col items-stretch gap-3 border-b border-zinc-700 bg-zinc-900/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-xl font-bold text-slate-100">Website Content</h2>
          {/* MODIFIED "Add Section" Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>+ Add Section</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableSectionsToAdd.map(section => (
                <DropdownMenuItem key={section.title} onSelect={() => handleCreatePredefinedSection(section)}>
                  Create "{section.title}" Section
                </DropdownMenuItem>
              ))}
              {availableSectionsToAdd.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={() => handleCreateNewSection(true)}>
                Create a Custom Section...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(isCreatingSection || editingSection) && ( /* ... Section Form remains the same ... */ <div className="border-b border-zinc-700 bg-zinc-900/30 p-4 sm:p-6"><h3 className="mb-3 text-lg font-bold text-slate-100">{editingSection?.id ? `Edit Section: ${editingSection.title}` : "Create New Custom Section"}</h3><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const data: Partial<PortfolioSection> = { title: formData.get("section_title") as string, type: formData.get("section_type") as PortfolioSection["type"], content: (formData.get("section_content") as string) || null, display_order: parseInt(formData.get("section_display_order") as string) || 0, }; handleSaveSection(data); }} className="space-y-3"><Input name="section_title" placeholder="Section Title" defaultValue={editingSection?.title || ""} required /><Select name="section_type" defaultValue={editingSection?.type || "markdown"} required><SelectTrigger><SelectValue placeholder="Select section type" /></SelectTrigger><SelectContent><SelectItem value="markdown">Markdown</SelectItem><SelectItem value="list_items">List of Items</SelectItem></SelectContent></Select><Textarea name="section_content" placeholder="Content (for Markdown type)" defaultValue={editingSection?.content || ""} rows={4} /><Input type="number" name="section_display_order" placeholder="Order (e.g., 1, 2, 3)" defaultValue={editingSection?.display_order?.toString() || "0"} /><div className="mt-3 flex gap-2"><Button type="submit" disabled={isLoading}>Save Section</Button><Button type="button" variant="secondary" onClick={() => { setIsCreatingSection(false); setEditingSection(null); }}>Cancel</Button></div></form></div>)}

        <div className="space-y-6 p-4 sm:p-6">
          {sections.map((section) => {
            const isPredefined = PREDEFINED_SECTIONS.some(p => p.title === section.title);
            return (
              <div key={section.id} draggable="true" onDragStart={(e) => handleDragStart(e, section.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, section)} className={`rounded-lg border bg-zinc-900/50 transition-all duration-200 ${draggedSectionId === section.id ? 'opacity-50 scale-95' : 'opacity-100'} ${isPredefined ? 'border-accent/30' : 'border-zinc-700'}`}>
                <div className="flex items-start">
                  <div className="p-3 cursor-grab active:cursor-grabbing touch-none text-zinc-500 hover:text-slate-200"><GripVertical className="size-5" /></div>
                  <div className="flex-grow border-l border-zinc-700">
                    <div className="flex flex-col items-start gap-2 border-b border-zinc-700 p-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        {isPredefined && <span title="Core Section">
                          <Lock className="size-4 text-accent" />
                        </span>}
                        <h3 className="text-lg font-bold text-slate-100">{section.title}{" "}<span className="block text-sm font-normal text-zinc-400 sm:inline">(Order: {section.display_order})</span></h3>
                      </div>
                      <div className="flex w-full shrink-0 gap-2 md:w-auto">
                        <Button size="sm" variant="outline" onClick={() => { setEditingSection(section); setIsCreatingSection(false); setIsCreatingItemInSection(null); setEditingItem(null); }}>Edit Section</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSection(section.id, isPredefined)} disabled={isLoading} title={isPredefined ? "Core sections cannot be deleted" : "Delete Section"}>Del Section</Button>
                      </div>
                    </div>
                    <div className="p-4">
                      {/* ... (Item rendering logic remains the same) ... */}
                      {section.type === "list_items" && (<div className="space-y-3"><h4 className="font-bold text-slate-200">Items:</h4>{section.portfolio_items && section.portfolio_items.length > 0 ? (section.portfolio_items.map((item) => (<div key={item.id} className="rounded-md border border-zinc-700 bg-zinc-800 p-3"><div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="flex-1"><p className="font-bold text-slate-100">{item.title}</p><p className="text-sm font-semibold text-accent">{item.subtitle}</p>{item.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.description}</p>}</div><div className="ml-0 shrink-0 space-x-1 sm:ml-2"><Button size="sm" variant="ghost" onClick={() => { setEditingItem(item); setIsCreatingItemInSection(section.id); setIsCreatingSection(false); setEditingSection(null); }}>Edit</Button><Button size="sm" variant="ghost" className="hover:bg-red-900/50 hover:text-red-300" onClick={() => handleDeleteItem(item.id)} disabled={isLoading}>Del</Button></div></div></div>))) : (<p className="text-sm italic text-zinc-500">No items in this section yet.</p>)}<Button size="sm" onClick={() => { setIsCreatingItemInSection(section.id); setEditingItem(null); setIsCreatingSection(false); setEditingSection(null); }}>+ Add Item to "{section.title}"</Button></div>)}
                      {((isCreatingItemInSection === section.id && !editingItem) || (editingItem && editingItem.section_id === section.id)) && (
                        <div className="mt-4 border-t border-zinc-700 bg-zinc-900/30 p-4">
                          <h4 className="text-md mb-3 font-bold text-slate-100">{editingItem ? `Edit Item: ${editingItem.title}` : `Create New Item`}</h4>
                          <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const tags = (formData.get("item_tags") as string).split(',').map(t => t.trim()).filter(Boolean); const data: Partial<PortfolioItem> = { title: formData.get("item_title") as string, subtitle: formData.get("item_subtitle") as string || null, description: formData.get("item_description") as string || null, link_url: formData.get("item_link") as string || null, image_url: formData.get("item_image_url") as string || null, tags: tags.length > 0 ? tags : null, display_order: parseInt(formData.get("item_display_order") as string) || 0, internal_notes: formData.get("item_internal_notes") as string || null, }; handleSaveItem(data, section.id); }} className="space-y-4">
                            <div><Label htmlFor="item_title">{formLabels.title} *</Label><Input name="item_title" id="item_title" defaultValue={editingItem?.title || ""} required /></div>
                            <div><Label htmlFor="item_subtitle">{formLabels.subtitle}</Label><Input name="item_subtitle" id="item_subtitle" defaultValue={editingItem?.subtitle || ""} /></div>
                            <div><Label htmlFor="item_description">{formLabels.description}</Label><Textarea name="item_description" id="item_description" defaultValue={editingItem?.description || ""} rows={4} /></div>
                            <div><Label htmlFor="item_link">{formLabels.link}</Label><Input name="item_link" id="item_link" defaultValue={editingItem?.link_url || ""} /></div>
                            <div><Label htmlFor="item_image_url">Image URL</Label><Input name="item_image_url" id="item_image_url" defaultValue={editingItem?.image_url || ""} /></div>
                            <div><Label htmlFor="item_tags">{formLabels.tags}</Label><Input name="item_tags" id="item_tags" defaultValue={editingItem?.tags?.join(", ") || ""} /></div>
                            <div><Label htmlFor="item_display_order">Display Order</Label><Input type="number" name="item_display_order" id="item_display_order" defaultValue={editingItem?.display_order?.toString() || "0"} /></div>
                            <div><Label htmlFor="item_internal_notes">Internal Notes</Label><Textarea name="item_internal_notes" id="item_internal_notes" defaultValue={editingItem?.internal_notes || ""} rows={2} /></div>
                            <div className="mt-4 flex gap-2"><Button type="submit" disabled={isLoading}>Save Item</Button><Button type="button" variant="secondary" onClick={() => { setIsCreatingItemInSection(null); setEditingItem(null); }}>Cancel</Button></div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}