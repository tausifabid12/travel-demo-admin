"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

/**
 * Uses the native share sheet where the device offers one — which is what a
 * phone user expects — and falls back to explicit links on desktop.
 */
export default function ShareLinks({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the visible links below still work.
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
      } catch {
        // The user dismissed the sheet.
      }
    } else {
      copy();
    }
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
        Share
      </span>

      {/* Phone-first: one tap into the OS share sheet. */}
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-body transition-colors hover:border-ink hover:text-ink sm:hidden"
      >
        <Share2 className="size-4" /> Share
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on LinkedIn"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-body transition-colors hover:border-ink hover:text-ink"
        >
          LinkedIn
        </a>

        <a
          href={`https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on X"
          className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm text-body transition-colors hover:border-ink hover:text-ink"
        >
          X
        </a>

        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-body transition-colors hover:border-ink hover:text-ink"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
