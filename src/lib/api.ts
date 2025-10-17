/*
This file contains data-fetching logic and is not related to styling. The comment has been updated for consistency with the redesign project. No functional changes are needed.
*/
import type { BlogPost, PortfolioSection } from "@/types";
import { supabase } from "@/supabase/client";

export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Failed to fetch posts from Supabase");
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching published blog posts:", error);
    return [];
  }
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is not an error in this case.
      throw new Error(error.message || "Post not found or error fetching");
    }
    return data || null;
  } catch (error) {
    console.error(`Error fetching blog post by slug "${slug}":`, error);
    return null;
  }
}

export async function fetchPortfolioSectionsWithItems(): Promise<
  PortfolioSection[]
> {
  try {
    const { data, error } = await supabase
      .from("portfolio_sections")
      .select(`*, portfolio_items (*)`)
      .order("display_order", { ascending: true })
      .order("display_order", {
        foreignTable: "portfolio_items",
        ascending: true,
      });

    if (error) {
      throw new Error(
        error.message || "Failed to fetch portfolio sections from Supabase"
      );
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching portfolio sections with items:", error);
    return [];
  }
}