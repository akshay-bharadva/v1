import Link from "next/link";
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import type { GitHubRepo } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProjectCardProps = PropsWithChildren & {
  project: GitHubRepo;
};

export default function ProjectCard({ children, project }: ProjectCardProps) {
  return (
    <Card className="group flex h-full flex-col transition-colors hover:border-accent/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="transition-colors group-hover:text-accent">
            {project.name.replaceAll("-", " ")}
          </CardTitle>
          {project.html_url && (
            <a
              href={project.html_url}
              rel="noopener noreferrer nofollow"
              target="_blank"
              title="View on GitHub"
              aria-label={`View ${project.name} on GitHub`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <BsArrowUpRight className="size-4 shrink-0" />
            </a>
          )}
        </div>
        <CardDescription className="line-clamp-3">
          {project.description || (
            <span className="italic">No description provided.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">{children}</CardContent>
      {(project.language || (project.topics && project.topics.length > 0)) && (
        <CardFooter className="flex flex-wrap gap-2">
          {project.language && (
            <Badge variant="secondary">{project.language}</Badge>
          )}
          {project.topics &&
            project.topics.slice(0, 3).map((topic: string) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
        </CardFooter>
      )}
    </Card>
  );
}
