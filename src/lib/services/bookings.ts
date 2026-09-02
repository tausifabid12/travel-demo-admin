import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Package from "@/lib/models/Package";
import { notifyTeam } from "@/lib/notify";
import { bookingSchema, type BookingInput } from "@/lib/validation";

/**
 * Human-readable, non-sequential reference. Sequential numbers would leak how
 * many bookings the business takes.
 */
function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
  const year = new Date().getFullYear().toString().slice(-2);
  return `BH${year}-${random}`;
}

export async function createBooking(input: unknown, ipAddress?: string) {
  const data: BookingInput = bookingSchema.parse(input);

  // Honeypot: accept silently so bots see success and stop retrying.
  if (data.website) return { spam: true as const };

  await dbConnect();

  const pkg = await Package.findOne({
    _id: data.packageId,
    status: "published",
  }).lean<{
    _id: unknown;
    title: string;
    priceFrom?: number;
    currency?: string;
  }>();

  if (!pkg) throw new Error("That package is no longer available");

  // Price is snapshotted at request time so later edits never rewrite what the
  // traveller was shown.
  const pricePerPerson = pkg.priceFrom;
  const travellers = data.adults + data.children;
  const estimatedTotal = pricePerPerson
    ? pricePerPerson * travellers
    : undefined;

  const { website, roomPreference, ...rest } = data;
  void website;

  const booking = await Booking.create({
    ...rest,
    roomPreference: roomPreference || undefined,
    reference: makeReference(),
    packageTitle: pkg.title,
    pricePerPerson,
    currency: pkg.currency ?? "INR",
    estimatedTotal,
    ipAddress,
  });

  await notifyTeam({
    audience: "enquiry",
    subject: `Booking request ${booking.reference} — ${pkg.title}`,
    lines: [
      `Reference: ${booking.reference}`,
      `Package: ${pkg.title}`,
      `Lead: ${booking.leadName}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Travellers: ${booking.adults} adults, ${booking.children} children`,
      booking.travelDate
        ? `Travel date: ${booking.travelDate.toDateString()}`
        : "Travel date: flexible",
      booking.roomPreference ? `Rooms: ${booking.roomPreference}` : "",
      booking.addOns.length ? `Add-ons: ${booking.addOns.join(", ")}` : "",
      estimatedTotal ? `Indicative total: ${estimatedTotal}` : "",
      "",
      booking.specialRequests ?? "",
    ].filter(Boolean),
  });

  return { spam: false as const, booking };
}

/** Looks a booking up by its reference, for the confirmation screen. */
export async function getBookingByReference(reference: string) {
  await dbConnect();
  const doc = await Booking.findOne({ reference }).lean();
  return doc ? (JSON.parse(JSON.stringify(doc)) as Record<string, unknown>) : null;
}
