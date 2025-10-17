"use client";

import { useState, useEffect, FormEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { PortfolioSection, PortfolioItem } from "@/types";
import { GripVertical } from "lucide-react";

const inputClass =
  "block w-full border-2 border-black rounded-none p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-space";
const textareaClass = `${inputClass} resize-y`;
const selectClass = `${inputClass} bg-white`;
const buttonPrimaryClass =
  "bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-none font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 font-space";
const buttonSecondaryClass =
  "bg-gray-200 hover:bg-gray-300 text-black py-2 px-3 rounded-none font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 font-space";
const buttonActionSmallClass = (
  actionColor: string,
  hoverActionColor: string,
  textColor: string = "text-black",
) =>
  `text-xs ${actionColor} hover:${hoverActionColor} ${textColor} px-2 py-1 rounded-none font-semibold border border-black shadow-[1px_1px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all font-space`;

interface ContentManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function ContentManager({ startInCreateMode, onActionHandled }: ContentManagerProps) {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null>(
    null,
  );
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isCreatingItemInSection, setIsCreatingItemInSection] = useState<
    string | null
  >(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, sectionId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSectionId(sectionId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetSection: PortfolioSection) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetSection.id) return;

    const currentSections = [...sections];
    const draggedIndex = currentSections.findIndex(s => s.id === draggedSectionId);
    const targetIndex = currentSections.findIndex(s => s.id === targetSection.id);

    // Remove dragged item and insert it at the new position
    const [draggedItem] = currentSections.splice(draggedIndex, 1);
    currentSections.splice(targetIndex, 0, draggedItem);

    // Optimistic UI update
    setSections(currentSections);
    setDraggedSectionId(null);

    // Update the database
    const sectionIdsInNewOrder = currentSections.map(s => s.id);
    const { error: rpcError } = await supabase.rpc('update_section_order', { section_ids: sectionIdsInNewOrder });

    if (rpcError) {
      setError("Failed to save new order: " + rpcError.message);
      await fetchPortfolioContent(); // Revert on error
    }
  };

  const fetchPortfolioContent = async () => {
    setIsLoading(true);
    setError(null);
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("portfolio_sections")
      .select(`*, portfolio_items (*)`)
      .order("display_order", { ascending: true })
      .order("display_order", {
        foreignTable: "portfolio_items",
        ascending: true,
      });

    if (sectionsError) {
      setError("Failed to load portfolio content: " + sectionsError.message);
      setSections([]);
    } else {
      setSections(sectionsData || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolioContent();
  }, []);

  const handleCreateNewSection = () => {
    setIsCreatingSection(true);
    setEditingSection(null);
    setEditingItem(null);
    setIsCreatingItemInSection(null);
  };

  useEffect(() => {
    if (startInCreateMode) {
      handleCreateNewSection();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const handleSaveSection = async (sectionData: Partial<PortfolioSection>) => {
    setIsLoading(true);
    setError(null);
    const { user_id, portfolio_items, id, ...saveData } = sectionData;

    let response;
    if (editingSection?.id) {
      response = await supabase
        .from("portfolio_sections")
        .update(saveData)
        .eq("id", editingSection.id)
        .select()
        .single();
    } else {
      response = await supabase
        .from("portfolio_sections")
        .insert(saveData)
        .select()
        .single();
    }

    if (response.error)
      setError("Failed to save section: " + response.error.message);
    else {
      setEditingSection(null);
      setIsCreatingSection(false);
      await fetchPortfolioContent();
    }
    setIsLoading(false);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm("Delete this section and ALL its items? This is irreversible.")
    )
      return;
    setIsLoading(true);
    const { error: deleteError } = await supabase
      .from("portfolio_sections")
      .delete()
      .eq("id", sectionId);
    if (deleteError)
      setError("Failed to delete section: " + deleteError.message);
    else await fetchPortfolioContent();
    setIsLoading(false);
  };

  const handleSaveItem = async (
    itemData: Partial<PortfolioItem>,
    sectionId: string,
  ) => {
    setIsLoading(true);
    setError(null);
    const { user_id, id, ...saveData } = itemData;

    let response;
    if (editingItem?.id) {
      response = await supabase
        .from("portfolio_items")
        .update({ ...saveData, section_id: sectionId })
        .eq("id", editingItem.id)
        .select()
        .single();
    } else {
      response = await supabase
        .from("portfolio_items")
        .insert({ ...saveData, section_id: sectionId })
        .select()
        .single();
    }

    if (response.error)
      setError("Failed to save item: " + response.error.message);
    else {
      setEditingItem(null);
      setIsCreatingItemInSection(null);
      await fetchPortfolioContent();
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item? This is irreversible.")) return;
    setIsLoading(true);
    const { error: deleteError } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", itemId);
    if (deleteError) setError("Failed to delete item: " + deleteError.message);
    else await fetchPortfolioContent();
    setIsLoading(false);
  };

  if (isLoading && sections.length === 0 && !error)
    return (
      <p className="p-4 font-space font-bold">Loading content manager...</p>
    );
  if (error && !editingItem && !editingSection)
    return (
      <p className="rounded-none border-2 border-red-500 bg-red-100 p-4 font-space font-semibold text-red-700">
        {error}
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto font-space"
    >
      <div className="rounded-none border-2 border-black bg-white">
        <div className="flex flex-col items-stretch gap-3 border-b-2 border-black bg-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-xl font-bold text-black">Portfolio Content</h2>
          <button
            onClick={handleCreateNewSection}
            className={buttonPrimaryClass}
          >
            + Add Section
          </button>
        </div>

        {(isCreatingSection || editingSection) && (
          <div className="border-b-2 border-black bg-yellow-50 p-4 sm:p-6">
            <h3 className="mb-3 text-lg font-bold text-black">
              {editingSection
                ? `Edit Section: ${editingSection.title}`
                : "Create New Section"}
            </h3>
            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: Partial<PortfolioSection> = {
                  title: formData.get("section_title") as string,
                  type: formData.get(
                    "section_type",
                  ) as PortfolioSection["type"],
                  content: (formData.get("section_content") as string) || null,
                  display_order:
                    parseInt(formData.get("section_display_order") as string) || 0,
                };
                handleSaveSection(data);
              }}
            >
              <input
                name="section_title"
                placeholder="Section Title"
                defaultValue={editingSection?.title || ""}
                required
                className={inputClass}
              />
              <select
                name="section_type"
                defaultValue={editingSection?.type || "markdown"}
                required
                className={selectClass}
              >
                <option value="markdown">Markdown</option>
                <option value="list_items">List of Items</option>
              </select>
              <textarea
                name="section_content"
                placeholder="Content (for Markdown type)"
                defaultValue={editingSection?.content || ""}
                className={textareaClass}
                rows={4}
              />
              <input
                type="number"
                name="section_display_order"
                placeholder="Order (e.g., 1, 2, 3)"
                defaultValue={editingSection?.display_order?.toString() || "0"}
                className={inputClass}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className={buttonPrimaryClass}
                  disabled={isLoading}
                >
                  Save Section
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingSection(false);
                    setEditingSection(null);
                  }}
                  className={buttonSecondaryClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6 p-4 sm:p-6">
          {sections.map((section) => (
            <div
              key={section.id}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section)}
              className={`rounded-none border-2 border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.05)] transition-all duration-200 ${draggedSectionId === section.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
            >
              <div className="flex items-start">
                <div className="p-3 cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-black">
                  <GripVertical className="size-5" />
                </div>
                <div className="flex-grow border-l-2 border-black">
                  <div className="mb-3 flex flex-col items-start gap-2 border-b border-black p-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-bold text-black">
                      {section.title}{" "}
                      <span className="block text-sm font-normal text-gray-600 sm:inline">
                        (Type: {section.type}, Order: {section.display_order})
                      </span>
                    </h3>
                    <div className="flex w-full shrink-0 gap-2 md:w-auto">
                      <button
                        onClick={() => {
                          setEditingSection(section);
                          setIsCreatingSection(false);
                          setEditingItem(null);
                          setIsCreatingItemInSection(null);
                        }}
                        className={`${buttonActionSmallClass("bg-blue-300", "bg-blue-400")} flex-1 md:flex-none`}
                      >
                        Edit Section
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={isLoading}
                        className={`${buttonActionSmallClass("bg-red-300", "bg-red-400", "text-white")} flex-1 md:flex-none`}
                      >
                        Del Section
                      </button>
                    </div>
                  </div>
                  <div
                    key={section.id}
                    className="rounded-none bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.05)]"
                  >
                    {section.type === "markdown" && (
                      <div className="prose prose-sm max-w-none font-space text-gray-800">
                        <p>
                          {section.content || (
                            <span className="italic">No content.</span>
                          )}
                        </p>
                      </div>
                    )}

                    {section.type === "list_items" && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-bold text-black">Items:</h4>
                        {section.portfolio_items &&
                          section.portfolio_items.length > 0 ? (
                          section.portfolio_items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-none border-2 border-black bg-gray-50 p-3"
                            >
                              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                  <p className="font-bold text-black">{item.title}</p>
                                  <p className="text-sm font-semibold text-indigo-700">
                                    {item.subtitle}
                                  </p>
                                  {item.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-700">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="ml-0 shrink-0 space-x-1 sm:ml-2">
                                  <button
                                    onClick={() => {
                                      setEditingItem(item);
                                      setIsCreatingItemInSection(section.id);
                                      setEditingSection(null);
                                      setIsCreatingSection(false);
                                    }}
                                    className={buttonActionSmallClass("bg-blue-300", "bg-blue-400")}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={isLoading}
                                    className={buttonActionSmallClass("bg-red-300", "bg-red-400", "text-white")}
                                  >
                                    Del
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm italic text-gray-600">
                            No items in this section yet.
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setIsCreatingItemInSection(section.id);
                            setEditingItem(null);
                            setEditingSection(null);
                            setIsCreatingSection(false);
                          }}
                          className={`${buttonPrimaryClass} mt-2 text-sm`}
                        >
                          + Add Item to "{section.title}"
                        </button>
                      </div>
                    )}
                    {((isCreatingItemInSection === section.id && !editingItem) ||
                      (editingItem && editingItem.section_id === section.id)) && (
                        <div className="mt-4 border-t-2 border-black bg-yellow-50 p-4">
                          <h4 className="text-md mb-2 font-bold text-black">
                            {editingItem
                              ? `Edit Item: ${editingItem.title}`
                              : `Create New Item in "${sections.find((s) => s.id === section.id)?.title || ""}"`}
                          </h4>
                          <form
                            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const data: Partial<PortfolioItem> = {
                                title: formData.get("item_title") as string,
                                subtitle: (formData.get("item_subtitle") as string) || null,
                                description: (formData.get("item_description") as string) || null,
                                link_url: (formData.get("item_link") as string) || null,
                                image_url: (formData.get("item_image_url") as string) || null,
                                tags: (formData.get("item_tags") as string)?.split(",").map((t) => t.trim()).filter((t) => t) || null,
                                display_order: parseInt(formData.get("item_display_order") as string) || 0,
                                internal_notes: (formData.get("item_internal_notes") as string) || null,
                              };
                              handleSaveItem(data, section.id);
                            }}
                          >
                            <input name="item_title" placeholder="Item Title" defaultValue={editingItem?.title || ""} required className={inputClass} />
                            <input name="item_subtitle" placeholder="Item Subtitle (optional)" defaultValue={editingItem?.subtitle || ""} className={inputClass} />
                            <textarea name="item_description" placeholder="Item Description (Markdown supported, optional)" defaultValue={editingItem?.description || ""} className={textareaClass} rows={3} />
                            <input name="item_link" placeholder="Item Link URL (e.g. https://example.com)" defaultValue={editingItem?.link_url || ""} className={inputClass} />
                            <input name="item_image_url" placeholder="Item Image URL (e.g. https://.../image.png)" defaultValue={editingItem?.image_url || ""} className={inputClass} />
                            <input name="item_tags" placeholder="Tags (comma-separated, optional)" defaultValue={editingItem?.tags?.join(", ") || ""} className={inputClass} />
                            <input type="number" name="item_display_order" placeholder="Order" defaultValue={editingItem?.display_order?.toString() || "0"} className={inputClass} />
                            <textarea name="item_internal_notes" placeholder="Internal Notes (Admin only, optional)" defaultValue={editingItem?.internal_notes || ""} className={textareaClass} rows={2} />

                            <div className="mt-2 flex gap-2">
                              <button type="submit" className={buttonPrimaryClass} disabled={isLoading}>
                                Save Item
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCreatingItemInSection(null);
                                  setEditingItem(null);
                                }}
                                className={buttonSecondaryClass}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}