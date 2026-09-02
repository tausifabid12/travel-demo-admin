import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      name,
      email: email.toLowerCase().trim(),
      password,
    });

    return NextResponse.json(
      { message: "Account created successfully", customerId: customer._id },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "An error occurred during signup" },
      { status: 500 }
    );
  }
}
