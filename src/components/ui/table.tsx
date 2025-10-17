import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>

>(({ className, ...props }, ref) => (

  <div className="relative w-full overflow-auto rounded-none border-2 border-black shadow-[4px_4px_0px_#000]">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm bg-white", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";


const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>

>(({ className, ...props }, ref) => (

  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b-2 [&_tr]:border-black bg-black text-white",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";


const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>

>(({ className, ...props }, ref) => (

  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";


const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>

>(({ className, ...props }, ref) => (

  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-black bg-gray-100 font-bold text-black [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";


const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>

>(({ className, ...props }, ref) => (

  <tr
    ref={ref}
    className={cn(
      "border-b-2 border-black transition-colors hover:bg-yellow-100 data-[state=selected]:bg-yellow-200 last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";


const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>

>(({ className, ...props }, ref) => (

  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-bold text-white [&:has([role=checkbox])]:pr-0 border-r-2 border-gray-600 last:border-r-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";


const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>

>(({ className, ...props }, ref) => (

  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0 border-r-2 border-black last:border-r-0",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";


const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>

>(({ className, ...props }, ref) => (

  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-700 font-semibold", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";


export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};