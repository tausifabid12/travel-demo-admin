"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter, INITIAL_FORM_STATE } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Subscribe"
      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white disabled:opacity-50"
    >
      <ArrowRight className="size-4" />
    </button>
  );
}

export default function NewsletterForm() {
  const [state, action] = useActionState(subscribeNewsletter, INITIAL_FORM_STATE);

  if (state.status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm text-white">
        <Check className="size-4 text-gold" /> {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="relative max-w-sm">
      {/* Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] w-px h-px overflow-hidden">
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="you@company.com"
        className="w-full border-0 border-b border-white/20 bg-transparent py-3 pr-10 text-sm text-white placeholder:text-white/40 transition-colors focus:border-gold focus:outline-none"
      />
      <Submit />

      {state.status === "error" && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
