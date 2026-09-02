"use client";

import { useActionState } from "react";
import { submitTicket } from "@/app/actions/purchase";
import { INITIAL_FORM_STATE } from "@/app/actions";
import { AlertCircle, Check } from "lucide-react";

export default function TicketForm({ user }: { user: any }) {
  const [state, action, isPending] = useActionState(submitTicket, INITIAL_FORM_STATE);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-line bg-leaf/10 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-leaf">Ticket Submitted</h3>
        <p className="mt-2 text-sm text-body">
          Your ticket reference is <strong>{state.reference}</strong>. We will contact you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="customerId" value={user.id} />
      <input type="hidden" name="customerName" value={user.name} />
      <input type="hidden" name="customerEmail" value={user.email} />

      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-brand/10 p-4 text-sm text-brand">
          <AlertCircle className="h-4 w-4" />
          <p>{state.message}</p>
        </div>
      )}

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium">Subject</label>
        <input 
          id="subject" 
          name="subject" 
          required 
          placeholder="What do you need help with?"
          className="w-full rounded-lg border border-line px-4 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
        <textarea 
          id="message" 
          name="message" 
          rows={5} 
          required 
          placeholder="Describe your issue or query in detail..."
          className="w-full rounded-lg border border-line px-4 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}
