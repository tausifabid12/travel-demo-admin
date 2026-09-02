"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** Turns a YouTube or Vimeo watch URL into its embed form. */
export function toEmbedUrl(url: string) {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?autoplay=1`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

  return url;
}

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open image ${i + 1} of ${images.length}`}
            className={cn(
              "group relative overflow-hidden bg-line/40",
              // Give the first image extra weight so the grid is not monotonous.
              i === 0 && "col-span-2 lg:col-span-2 row-span-2",
            )}
            style={{ aspectRatio: i === 0 ? "3/2" : "4/3" }}
          >
            <Image
              src={src}
              alt={`${alt} — image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-100 bg-ink/95 flex items-center justify-center"
        >
          <button
            onClick={close}
            aria-label="Close viewer"
            className="absolute top-5 right-5 z-10 size-11 grid place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 z-10 size-11 grid place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="size-7" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 sm:right-6 z-10 size-11 grid place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="size-7" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-6xl max-h-[85vh] m-6">
            <Image
              src={images[index]}
              alt={`${alt} — image ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <p className="absolute bottom-6 text-sm text-white/60 tabular-nums">
            {index + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

export function VideoLightbox({
  url,
  poster,
  label = "Watch the film",
}: {
  url: string;
  poster?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden bg-line/40"
        style={{ aspectRatio: "16/9" }}
      >
        {poster && (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-ink/30 transition-colors group-hover:bg-ink/40" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-3 rounded-full bg-white/95 px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-300 group-hover:scale-105">
            <Play className="size-4 fill-current" /> {label}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          className="fixed inset-0 z-100 bg-ink/95 flex items-center justify-center p-6"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close video"
            className="absolute top-5 right-5 size-11 grid place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-6" />
          </button>
          <div className="w-full max-w-5xl" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={toEmbedUrl(url)}
              title="Video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
