"use server";

import { headers } from "next/headers";
import { ZodError } from "zod";
import { createEnquiry, createApplication } from "@/lib/services/submissions";
import { createBooking } from "@/lib/services/bookings";
import dbConnect from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import Purchase from "@/lib/models/Purchase";
import Package from "@/lib/models/Package";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  /** Set on a successful booking so the form can show the reference. */
  reference?: string;
};

export const INITIAL_FORM_STATE: FormState = { status: "idle" };

function toState(err: unknown): FormState {
  if (err instanceof ZodError) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  console.error(err);
  return {
    status: "error",
    message:
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again, or email us directly.",
  };
}

function formToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function submitEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // headers() is async in Next 16.
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

    await createEnquiry(formToObject(formData), ip);

    return {
      status: "success",
      message:
        "Thank you — your enquiry is with us. We respond within one working day.",
    };
  } catch (err) {
    return toState(err);
  }
}

export async function submitApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createApplication(formToObject(formData));
    return {
      status: "success",
      message:
        "Thank you — your application is in. We read every one and will be in touch.",
    };
  } catch (err) {
    return toState(err);
  }
}

export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const email = String(formData.get("email") ?? "");
    await createEnquiry({
      name: email.split("@")[0] || "Subscriber",
      email,
      message: "Newsletter subscription request from the site footer.",
      source: "Newsletter",
      website: String(formData.get("website") ?? ""),
    });
    return { status: "success", message: "You are on the list." };
  } catch (err) {
    return toState(err);
  }
}

export async function submitBooking(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

    const raw = formToObject(formData);
    const result = await createBooking(
      {
        ...raw,
        // Checkboxes only appear in FormData when ticked.
        flexibleDates: formData.get("flexibleDates") === "on",
        addOns: formData.getAll("addOns").map(String),
      },
      ip,
    );

    if (result.spam) {
      return { status: "success", message: "Thank you." };
    }

    return {
      status: "success",
      message: "Your booking request is in.",
      reference: result.booking.reference,
    };
  } catch (err) {
    return toState(err);
  }
}
