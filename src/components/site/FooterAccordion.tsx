"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Column = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

/**
 * Mobile footer navigation as collapsible rows — the pattern an app uses for
 * a settings or "more" screen, rather than a wall of links.
 */
export default function FooterAccordion({ columns }: { columns: Column[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="px-6">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {columns.map((column) => {
          const expanded = open === column.label;
          const links = column.children ?? [];

          return (
            <div key={column.label} className="border-b border-white/10 last:border-0">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : column.label)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between px-4 py-4 text-left text-sm text-white active:bg-white/5"
              >
                {column.label}
                <ChevronDown
                  className={cn(
                    "size-4 text-white/40 transition-transform duration-300",
                    expanded && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <ul className="pb-2">
                    {links.map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="block px-4 py-3 pl-6 text-sm text-white/60 active:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
