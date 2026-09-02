import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";
import Package from "@/lib/models/Package";
import { Container } from "@/components/site/primitives";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui";

export default async function CustomerDashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "Customer") {
    redirect("/login");
  }

  await dbConnect();

  // Find purchases related to this customer either by ID or email
  const purchases = await Purchase.find({
    $or: [{ customerId: user.id }, { customerEmail: user.email }],
  })
    .populate("packageId", "title slug heroImage")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="wide">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome, {user.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your purchases and track your bookings.
            </p>
          </div>
          <Link href="/support">
            <Button variant="secondary">Support</Button>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Your Purchases</h2>
          
          {purchases.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500">You haven't purchased any packages yet.</p>
              <Link href="/travelxl" className="mt-4 inline-block font-medium text-brand hover:underline">
                Explore packages &rarr;
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {purchases.map((purchase: any) => (
                <div key={purchase._id} className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {purchase.packageId?.heroImage ? (
                    <img src={purchase.packageId.heroImage} alt="" className="h-16 w-24 rounded-md object-cover" />
                  ) : (
                    <div className="h-16 w-24 rounded-md bg-gray-100" />
                  )}
                  <div className="flex-1">
                    <Link href={`/travelxl/${purchase.packageId?.slug}`} className="font-semibold text-gray-900 hover:underline">
                      {purchase.packageId?.title || "Unknown Package"}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>Purchased on {formatDate(purchase.createdAt)}</span>
                      <span>•</span>
                      <span>Amount: {purchase.currency} {purchase.amount}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      purchase.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                  <div>
                    <Link href={`/dashboard/purchases/${purchase._id}`}>
                      <Button variant="ghost" size="sm">
                        Download Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
