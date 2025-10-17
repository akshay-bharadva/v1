import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
({ className, ...props }, ref) => {
return (
<textarea
className={cn(
"flex min-h-[80px] w-full rounded-none border-2 border-black bg-background px-3 py-2 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[2px_2px_0px_#000] focus-visible:shadow-none resize-y font-space",
className,
)}
ref={ref}
{...props}
/>
);
},
);
Textarea.displayName = "Textarea";

export { Textarea };