import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-2 border-black text-sm font-bold shadow-[2px_2px_0px_#000] ring-offset-background transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "border-black bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-black bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "border-black bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border-transparent shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-accent hover:text-accent-foreground hover:shadow-none active:translate-x-0 active:translate-y-0",
        link: "border-transparent text-primary underline-offset-4 shadow-none hover:translate-x-0 hover:translate-y-0 hover:underline hover:shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };