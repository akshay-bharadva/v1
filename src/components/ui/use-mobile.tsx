"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
const [isMobile, setIsMobile] = React.useState<boolean>(() => {
if (typeof window !== "undefined") {
return window.innerWidth < MOBILE_BREAKPOINT;
}
return false;
});

React.useEffect(() => {
if (typeof window === "undefined") {
return;
}

const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

const handleChange = () => {
  setIsMobile(mql.matches);
};

handleChange();

mql.addEventListener("change", handleChange);

return () => mql.removeEventListener("change", handleChange);


}, []);

return isMobile;
}