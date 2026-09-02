import { PageHeader } from "@/components/ui/PageHeader";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/lib/models/SupportTicket";
import { formatDistanceToNow } from "date-fns";

export default async function AdminSupportPage() {
  await dbConnect();
  
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Support Tickets"
        description="Manage and respond to customer support tickets."
      />

      <div className="mt-8 rounded-xl border border-admin-border bg-admin-surface shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-admin-text-secondary">
          <thead className="bg-admin-surface-hover text-admin-text-primary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {tickets.map((ticket: any) => (
              <tr key={ticket._id} className="hover:bg-admin-surface-hover/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-admin-text-primary">{ticket.customerName}</p>
                  <p className="text-xs text-admin-text-tertiary">{ticket.customerEmail}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-admin-text-primary">{ticket.subject}</p>
                  <p className="text-xs text-admin-text-tertiary truncate max-w-[300px]">
                    {ticket.message}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${ticket.status === 'Open' ? 'bg-amber-100 text-amber-800' : ''}
                    ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${ticket.status === 'Closed' ? 'bg-slate-100 text-slate-800' : ''}
                  `}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-admin-text-tertiary">
                  No support tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
