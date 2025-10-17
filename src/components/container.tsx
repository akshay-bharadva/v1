import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = PropsWithChildren<{ className?: string }>;

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-8 md:px-16 xl:px-48 2xl:px-72", className)}>
      {children}
    </div>
  );
}