"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// While `active`, keeps Tab focus cycling inside the container, moves focus into it on open,
// and restores focus to whatever triggered it once it closes.
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? container)?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !container) return;

      const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleTab);
      previouslyFocused.current?.focus();
    };
  }, [active, containerRef]);
}
