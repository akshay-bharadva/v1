"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-black group-[.toaster]:rounded-none group-[.toaster]:shadow-[3px_3px_0px_#000] group-[.toaster]:p-4",
          title: "group-[.toast]:font-bold group-[.toast]:text-base",
          description: "group-[.toast]:text-gray-700 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:rounded-none group-[.toast]:shadow-[2px_2px_0px_#000] hover:group-[.toast]:bg-primary/90 group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-gray-200 group-[.toast]:text-black group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:rounded-none group-[.toast]:shadow-[2px_2px_0px_#000] hover:group-[.toast]:bg-gray-300 group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-semibold",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-black group-[.toast]:border-0 group-[.toast]:shadow-none hover:group-[.toast]:bg-gray-200 group-[.toast]:p-1 group-[.toast]:rounded-none group-[.toast]:border-black group-[.toast]:border-2 group-[.toast]:right-2 group-[.toast]:top-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
