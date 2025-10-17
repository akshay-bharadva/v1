import { cn } from "@/lib/utils";

function Skeleton({
className,
...props
}: React.HTMLAttributes<HTMLDivElement>) {
return (
<div
className={cn(
"animate-pulse rounded-none bg-gray-300 border-2 border-black",
className,
)}
{...props}
/>
);
}

export { Skeleton };