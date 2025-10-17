"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none border-2 border-black text-sm font-bold shadow-[2px_2px_0px_#000] ring-offset-background transition-all duration-150 hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_#000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 active:translate-x-px active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none data-[state=on]:border-black data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-[1px_1px_0px_hsl(var(--primary-foreground))_inset] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-yellow-200",
        outline: "bg-transparent hover:bg-yellow-200",
      },
      size: {
        default: "h-10 min-w-10 px-3",
        sm: "h-9 min-w-9 px-2.5",
        lg: "h-11 min-w-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>

>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };