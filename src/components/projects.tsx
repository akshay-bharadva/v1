// This component is heavily refactored for the new interactive design.
// - It now fetches project cover images from a hypothetical field `cover_image_url` in the database. 
//   You'll need to add this field to your `portfolio_items` table. For now, I will use placeholder images.
// - The grid layout is replaced with a list.
// - A hover effect is implemented where a project image appears in a fixed container.
// - Scroll-triggered animations are added to each project item.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsArrowUpRight } from "react-icons/bs";
import type { GitHubRepo } from "@/types";

const GITHUB_USERNAME = `akshay-bharadva`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9&type=owner`;

// Placeholder images. In a real scenario, you'd fetch these from a CMS or map them.
const projectImages: { [key: string]: string } = {
  "akshay-bharadva.github.io": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60",
  "signoz": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=60",
  "portfolio-v2": "https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=800&q=60",
  "nextjs-blog": "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=60",
};

export default function Projects() {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProjectImage, setHoveredProjectImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetching logic remains the same
    setLoading(true);
    setError(null);
    fetch(GITHUB_REPOS_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`GitHub API request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data: GitHubRepo[]) => {
        const filteredProjects = data.filter(p => !p.private && !p.fork && p.description)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
          .slice(0, 6); // Limit to 6 for a cleaner list
        setProjects(filteredProjects);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Could not load projects.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative w-full border-t border-white/10 bg-background py-20 md:py-32">
      <div className="mx-auto w-full px-4 sm:px-8 md:px-16 xl:px-48 2xl:px-72">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-4xl font-bold text-slate-400 md:text-5xl"
        >
          Selected Works
        </motion.h2>

        {/* This div will hold the floating image */}
        <motion.div
            animate={{ opacity: hoveredProjectImage ? 1 : 0, scale: hoveredProjectImage ? 1 : 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-none fixed top-1/2 left-1/2 z-10 hidden h-64 w-96 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-white/10 bg-zinc-900 p-2 shadow-2xl lg:block"
        >
            {hoveredProjectImage && (
                <img src={hoveredProjectImage} alt="Project preview" className="h-full w-full object-cover" />
            )}
        </motion.div>

        <div className="border-t border-white/10">
          {loading && <p className="py-8 text-center text-slate-400">Loading projects...</p>}
          {error && <p className="py-8 text-center text-red-400">Error: {error}</p>}
          
          {!loading && !error && projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.html_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredProjectImage(projectImages[project.name] || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60')}
              onMouseLeave={() => setHoveredProjectImage(null)}
              className="group flex items-center justify-between border-b border-white/10 py-8 transition-colors duration-300 hover:bg-white/5"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-sm text-slate-500">{(index + 1).toString().padStart(2, '0')}</span>
                <h3 className="text-2xl font-bold text-slate-200 transition-colors duration-300 group-hover:text-accent md:text-4xl">
                  {project.name.replace(/-/g, " ")}
                </h3>
              </div>
              <p className="hidden text-slate-400 md:block">{project.language}</p>
              <BsArrowUpRight className="text-2xl text-slate-400 transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}