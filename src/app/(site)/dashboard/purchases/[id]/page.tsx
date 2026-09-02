import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import Package from "@/lib/models/Package";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice } from "@/components/site/PackageCard";
import Link from "next/link";
import { Download, ChevronLeft } from "lucide-react";

export default async function DownloadDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = await getSessionUser();

  if (!session || !user || user.role !== "Customer") {
    redirect("/login");
  }

  await dbConnect();
  const purchase = await Purchase.findOne({ _id: params.id, customerId: user.id }).lean();
  
  if (!purchase) {
    redirect("/dashboard");
  }

  const pkg = await Package.findById(purchase.packageId).lean();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-12 lg:py-24">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-body hover:text-brand mb-6">
        <ChevronLeft className="mr-1 size-4" /> Back to Dashboard
      </Link>
      
      <PageHeader 
        title="Purchase Details" 
        description={`Reference: ${purchase._id.toString().slice(-8).toUpperCase()}`} 
      />

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-line pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-1">{pkg?.title || "Unknown Package"}</h2>
            <p className="text-sm text-muted">Status: <span className="text-brand font-medium">{purchase.status}</span></p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-2xl font-bold text-ink">{formatPrice(purchase.amount, purchase.currency)}</p>
            <p className="text-xs text-muted">Transaction ID: {purchase.transactionId}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3">Customer Details</h3>
            <p className="text-sm text-body mb-1">{purchase.customerName}</p>
            <p className="text-sm text-body mb-1">{purchase.customerEmail}</p>
            <p className="text-sm text-body">{purchase.customerPhone}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Next Steps</h3>
            <p className="text-sm text-body leading-relaxed">
              Your purchase is confirmed. Our team will reach out to you within 24 hours to coordinate the finer details of your trip.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand">
                <Download className="mr-2 size-4" /> Download Itinerary
              </button>
              <button className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink">
                <Download className="mr-2 size-4" /> Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
