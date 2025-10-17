"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col border-2 border-black rounded-none shadow-[4px_4px_0px_#000] bg-white overflow-hidden",
      className,
    )}
    {...props}
  />
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = ResizablePrimitive.Panel;
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-transparent after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      "data-[panel-group-direction=horizontal]:w-2 data-[panel-group-direction=vertical]:h-2",
      "data-[resize-handle-state=hover]:bg-indigo-600/30 data-[resize-handle-state=drag]:bg-indigo-700/50",
      "after:bg-black data-[resize-handle-state=hover]:after:bg-indigo-600 data-[resize-handle-state=drag]:after:bg-indigo-700",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-none border border-black bg-gray-200 shadow-[1px_1px_0px_#000] hover:bg-gray-300">
        <GripVertical className="size-2.5 text-black" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };