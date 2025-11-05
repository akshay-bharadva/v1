/*
This component is redesigned to fit the "Digital Blueprint" theme.
- It features a prominent heading with a blueprint-style underline.
- Project cards are loaded dynamically and displayed in a grid.
- The animation staggers the appearance of each card for a dynamic effect.
- The "More on GitHub" button is styled as a primary call-to-action.
*/
import { useState, useEffect } from "react";
import { ArrowUpRight, Github, AlertTriangle, Loader2 } from "lucide-react";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

type ProjectsProps = {};

const GITHUB_USERNAME = `akshay-bharadva`;
// Fetch fewer for the homepage to keep it concise, but more on the dedicated projects page.
const REPO_COUNT = 6;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=${REPO_COUNT}&type=owner`;

export default function Projects({}: ProjectsProps) {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(GITHUB_REPOS_URL)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          throw new Error(
            `GitHub API request failed: ${response.status} - ${errorData.message || "Unknown error"}`,
          );
        }
        return response.json();
      })
      .then((data: GitHubRepo[]) => {
        const filteredProjects = data
          .filter(
            (p) =>
              !p.private &&
              p.language &&
              !p.fork &&
              !p.archived &&
              p.name !== GITHUB_USERNAME,
          )
          .sort(
            (a, b) =>
              (b.stargazers_count || 0) - (a.stargazers_count || 0) ||
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
        setProjects(filteredProjects.slice(0, 9));
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Could not load projects at this time.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="my-24 py-16">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative mb-12"
      >
        <h2 className="text-4xl font-black text-foreground">Recent Projects</h2>
        <div className="absolute -bottom-2 h-1 w-24 bg-primary" />
      </motion.div>
      
      {loading && (
        <div className="py-10 text-center">
          <div className="mx-auto inline-block size-12 animate-spin rounded-none border-y-4 border-black"></div>
          <p className="mt-4 text-lg font-bold text-black">
            Loading Projects from GitHub...
          </p>
        </div>
      )}
      {error && !loading && (
        <div className="rounded-none border-2 border-red-500 bg-red-100 p-4 font-semibold text-red-700 shadow-[3px_3px_0_#B91C1C]">
          Error: {error}
        </div>
      )}
      {!loading && !error && projects.length === 0 && (
        <div className="rounded-none border-2 border-black bg-yellow-100 p-8 py-16 text-center shadow-[6px_6px_0_#000]">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-none border-2 border-black bg-black text-5xl font-black text-yellow-300">
              ?
            </div>
            <h3 className="mb-2 text-2xl font-bold text-black">
              NO PUBLIC PROJECTS FOUND.
            </h3>
            <p className="font-medium text-gray-700">
              I might be working on something new, or they are private. Check
              GitHub for more!
            </p>
          </div>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <motion.div 
            className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                 <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button asChild size="lg" className="text-md group">
              <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                More on GitHub 
                <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
          </motion.div>
        </>
      )}
    </section>
  );
}