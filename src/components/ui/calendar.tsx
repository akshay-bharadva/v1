"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 border-2 border-black rounded-none shadow-[4px_4px_0px_#000] bg-white",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-black",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-black rounded-none w-9 font-bold text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-none [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-yellow-300 first:[&:has([aria-selected])]:rounded-none last:[&:has([aria-selected])]:rounded-none focus-within:relative focus-within:z-20 border-2 border-transparent data-[selected=true]:border-black",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-none hover:bg-gray-200",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 focus:bg-yellow-500 focus:text-black shadow-[1px_1px_0px_#000]",
        day_today:
          "bg-indigo-200 text-black border-2 border-indigo-500 font-bold",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-yellow-200/50 aria-selected:text-gray-700",
        day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-yellow-300/80 aria-selected:text-black rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        // IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };