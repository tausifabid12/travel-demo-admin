import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/lib/models/SupportTicket";
import { PageHeader } from "@/components/ui/PageHeader";
import TicketForm from "./TicketForm";

export default async function CustomerSupportPage() {
  const session = await getServerSession(authOptions);
  const user = await getSessionUser();

  if (!session || !user || user.role !== "Customer") {
    redirect("/login?callbackUrl=/support");
  }

  await dbConnect();
  const tickets = await SupportTicket.find({ customerId: user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-12 lg:py-24">
      <PageHeader 
        title="Customer Support" 
        description="We're here to help. View your past tickets or create a new one." 
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-display font-semibold mb-6">Create a New Ticket</h2>
          <TicketForm user={user} />
        </div>

        <div>
          <h2 className="text-xl font-display font-semibold mb-6">Your Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-body text-sm">You haven't opened any tickets yet.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <div key={ticket._id} className="p-4 rounded-xl border border-line bg-surface">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-brand/10 text-brand">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-2 line-clamp-2">
                    {ticket.message}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
