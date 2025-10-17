/*
This file's comment is updated for consistency as part of the redesign. The component itself is fundamental for the new theme-switching functionality and remains unchanged. It correctly uses the `next-themes` library to manage theme changes.
*/
"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}