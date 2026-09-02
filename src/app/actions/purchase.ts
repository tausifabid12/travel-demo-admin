"use server";

import dbConnect from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import Purchase from "@/lib/models/Purchase";
import Package from "@/lib/models/Package";
import SupportTicket from "@/lib/models/SupportTicket";
import type { FormState } from "@/app/actions";

export async function submitPurchase(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await dbConnect();
    const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { leadName, email, phone, packageId } = raw;

    if (!leadName || !email || !phone || !packageId) {
      return { status: "error", message: "Missing required fields for purchase." };
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return { status: "error", message: "Package not found." };
    }

    const travellers = Number(raw.adults || 1) + Number(raw.children || 0);
    const amount = pkg.priceFrom ? pkg.priceFrom * travellers : 0;
    const currency = pkg.currency || "INR";

    // Create or find customer
    let customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      customer = await Customer.create({
        name: leadName,
        email: email.toLowerCase().trim(),
        phone: phone,
        // Using a default placeholder password for guest checkouts
        password: Math.random().toString(36).slice(-10),
      });
    }

    const purchase = await Purchase.create({
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || phone,
      packageId,
      amount,
      currency,
      status: "Completed", // Mocking completed payment
      transactionId: `MOCK_TXN_${Date.now()}`,
      paymentMethod: "Mock Testing",
    });

    return {
      status: "success",
      message: "Your purchase is confirmed.",
      reference: purchase._id.toString().slice(-8).toUpperCase(),
    };
  } catch (err: any) {
    console.error(err);
    return {
      status: "error",
      message: err.message || "An error occurred during purchase.",
    };
  }
}

export async function submitTicket(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await dbConnect();
    const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { customerId, customerName, customerEmail, subject, message } = raw;

    if (!customerId || !subject || !message) {
      return { status: "error", message: "Missing required fields." };
    }

    const ticket = await SupportTicket.create({
      customerId,
      customerName,
      customerEmail,
      subject,
      message,
    });

    return {
      status: "success",
      message: "Your ticket has been submitted. We will contact you shortly.",
      reference: ticket._id.toString().slice(-8).toUpperCase(),
    };
  } catch (err: any) {
    console.error(err);
    return {
      status: "error",
      message: err.message || "An error occurred.",
    };
  }
}

