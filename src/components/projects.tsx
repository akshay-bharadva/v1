/*
This file is updated for the new kinetic typography theme.
- The heavy neo-brutalist header is replaced with a clean, modern typographic header.
- The project grid now uses the redesigned `ProjectCard` component.
- The "More on GitHub" link is now a standard `Button` component.
- The loading and error/empty states are redesigned to be minimal and consistent with the new theme, using a `Loader2` spinner and clean text.
*/
import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type ProjectsProps = PropsWithChildren;

const GITHUB_USERNAME = `akshay-bharadva`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9&type=owner`;

export default function Projects({ children }: ProjectsProps) {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(GITHUB_REPOS_URL);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || "Unknown error"}`);
        }
        const data: GitHubRepo[] = await response.json();
        const filteredProjects = data
          .filter((p) => !p.private && p.language && !p.fork && !p.archived && p.name !== GITHUB_USERNAME)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
        setProjects(filteredProjects.slice(0, 6)); // Show 6 for a cleaner grid
      } catch (err: any) {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Could not load projects at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section className="my-16">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 border-b border-border pb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        Recent Projects
      </motion.h2>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {error && !loading && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center text-sm text-destructive">
          <h3 className="font-semibold">Error Loading Projects</h3>
          <p className="mt-2">{error}</p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center rounded-lg border-2 border-dashed border-border bg-card py-20">
          <h3 className="text-xl font-bold">No Public Projects Found</h3>
          <p className="text-muted-foreground">I might be working on something new in private. Check GitHub for more!</p>
        </div>
      )}
      
      {!loading && !error && projects.length > 0 && (
        <>
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                More on GitHub <BsArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}