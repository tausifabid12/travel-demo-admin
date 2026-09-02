"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  GripVertical,
  ImageIcon,
  Library,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Field, Input, Textarea, Card } from "@/components/ui";
import MediaPicker from "@/components/admin/MediaPicker";

/* ---------------------------- Repeater field --------------------------- */

/** A reorderable list of plain strings — highlights, inclusions, exclusions. */
export function RepeaterField({
  label,
  hint,
  value,
  onChange,
  placeholder = "Add an item",
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const update = (index: number, text: string) =>
    onChange(value.map((v, i) => (i === index ? text : v)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Move up"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                className="text-admin-text-secondary hover:text-admin-text-primary disabled:opacity-25 leading-none text-[10px]"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Move down"
                onClick={() => move(index, index + 1)}
                disabled={index === value.length - 1}
                className="text-admin-text-secondary hover:text-admin-text-primary disabled:opacity-25 leading-none text-[10px]"
              >
                ▼
              </button>
            </div>
            <Input
              value={item}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Remove"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange([...value, ""])}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </Field>
  );
}

/* --------------------------- Itinerary builder ------------------------- */

export type ItineraryDay = { day: number; title: string; description: string };

export function ItineraryBuilder({
  value,
  onChange,
}: {
  value: ItineraryDay[];
  onChange: (next: ItineraryDay[]) => void;
}) {
  /** Day numbers are always the array order, so they never drift out of sync. */
  const renumber = (days: ItineraryDay[]) =>
    days.map((d, i) => ({ ...d, day: i + 1 }));

  const update = (index: number, patch: Partial<ItineraryDay>) =>
    onChange(value.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(renumber(next));
  };

  return (
    <Field label="Itinerary" hint="Day numbers follow the order below.">
      <div className="flex flex-col gap-3">
        {value.map((day, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-admin-accent">
                Day {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Move day up"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                >
                  ▲
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Move day down"
                  onClick={() => move(index, index + 1)}
                  disabled={index === value.length - 1}
                >
                  ▼
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remove day"
                  onClick={() =>
                    onChange(renumber(value.filter((_, i) => i !== index)))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                value={day.title}
                onChange={(e) => update(index, { title: e.target.value })}
                placeholder="Day title, e.g. Arrival and welcome reception"
              />
              <Textarea
                value={day.description}
                onChange={(e) => update(index, { description: e.target.value })}
                placeholder="What happens on this day"
                rows={3}
              />
            </div>
          </Card>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() =>
            onChange([
              ...value,
              { day: value.length + 1, title: "", description: "" },
            ])
          }
        >
          <Plus className="size-3.5" /> Add day
        </Button>
      </div>
    </Field>
  );
}

/* ------------------------------ Media fields --------------------------- */

function isImageUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function ImageUrlField({
  label,
  hint,
  value,
  onChange,
  altValue,
  onAltChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  altValue?: string;
  onAltChange?: (alt: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <Field
      label={label}
      hint={hint ?? "Paste an image URL, or pick one from the media library."}
    >
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 rounded-md border border-admin-border bg-admin-bg overflow-hidden grid place-items-center">
          {value && isImageUrl(value) && !broken ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setBroken(true)}
              unoptimized
            />
          ) : (
            <ImageIcon className="size-6 text-admin-text-secondary/40" />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => {
                setBroken(false);
                onChange(e.target.value);
              }}
              placeholder="https://…"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setPickerOpen(true)}
            >
              <Library className="size-4" />
            </Button>
          </div>
          {onAltChange && (
            <Input
              value={altValue ?? ""}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Alt text, for screen readers and SEO"
            />
          )}
          {broken && value && (
            <p className="text-xs text-amber-400">
              That URL did not load. Check it is public and points at an image.
            </p>
          )}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setBroken(false);
          onChange(asset.url);
          if (onAltChange && asset.alt) onAltChange(asset.alt);
          setPickerOpen(false);
        }}
      />
    </Field>
  );
}

export function GalleryUrlField({
  label = "Gallery",
  value,
  onChange,
}: {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const add = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  return (
    <Field label={label} hint="Images appear on the site in this order.">
      <div className="flex flex-col gap-3">
        {value.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {value.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative aspect-4/3 rounded-md overflow-hidden border border-admin-border bg-admin-bg group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    aria-label="Move left"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...value];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                    className="text-white/80 hover:text-white disabled:opacity-30 px-1"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    className="text-red-300 hover:text-red-200 px-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move right"
                    disabled={index === value.length - 1}
                    onClick={() => {
                      const next = [...value];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      onChange(next);
                    }}
                    className="text-white/80 hover:text-white disabled:opacity-30 px-1"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
                setDraft("");
              }
            }}
            placeholder="Paste an image URL and press Enter"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPickerOpen(true)}
          >
            <Library className="size-4" /> Library
          </Button>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          add(asset.url);
          setPickerOpen(false);
        }}
      />
    </Field>
  );
}

/* -------------------------------- SEO ---------------------------------- */

export type SeoValue = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export function SeoFields({
  value,
  onChange,
  fallbackTitle,
  slug,
  pathPrefix,
}: {
  value: SeoValue;
  onChange: (next: SeoValue) => void;
  fallbackTitle?: string;
  slug?: string;
  pathPrefix?: string;
}) {
  const title = value.metaTitle || fallbackTitle || "";
  const description = value.metaDescription || "";

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 bg-admin-bg/50">
        <p className="text-xs uppercase tracking-wider text-admin-text-secondary mb-3">
          Search preview
        </p>
        <p className="text-xs text-green-500/80 truncate">
          bhancer.com{pathPrefix}/{slug || "…"}
        </p>
        <p className="text-base text-blue-400 truncate mt-0.5">
          {title || "Untitled"}
        </p>
        <p className="text-sm text-admin-text-secondary line-clamp-2 mt-0.5">
          {description || "No meta description set — search engines will guess."}
        </p>
      </Card>

      <Field
        label="Meta title"
        hint={`${title.length}/60 characters. Falls back to the title if left blank.`}
      >
        <Input
          value={value.metaTitle ?? ""}
          onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
          placeholder={fallbackTitle}
        />
      </Field>

      <Field
        label="Meta description"
        hint={`${description.length}/160 characters is the sweet spot.`}
      >
        <Textarea
          value={value.metaDescription ?? ""}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
          rows={3}
        />
      </Field>

      <ImageUrlField
        label="Social share image"
        hint="Shown when the page is shared. 1200×630 works best."
        value={value.ogImage ?? ""}
        onChange={(ogImage) => onChange({ ...value, ogImage })}
      />
    </div>
  );
}

/* ---------------------------- Slug field ------------------------------- */

export function SlugField({
  value,
  onChange,
  pathPrefix,
  sourceTitle,
}: {
  value: string;
  onChange: (slug: string) => void;
  pathPrefix: string;
  sourceTitle?: string;
}) {
  return (
    <Field
      label="URL slug"
      hint={
        value
          ? `Live at ${pathPrefix}/${value}`
          : "Left blank, this is generated from the title."
      }
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-admin-text-secondary whitespace-nowrap">
          {pathPrefix}/
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={sourceTitle ? "auto-generated" : ""}
        />
        {value && (
          <a
            href={`${pathPrefix}/${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-admin-text-secondary hover:text-admin-accent p-2"
            aria-label="Open on the site"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </Field>
  );
}

/* --------------------------- Drag handle row --------------------------- */

export function DragHandle({ className }: { className?: string }) {
  return (
    <GripVertical
      className={cn(
        "size-4 text-admin-text-secondary/50 cursor-grab active:cursor-grabbing",
        className,
      )}
    />
  );
}
