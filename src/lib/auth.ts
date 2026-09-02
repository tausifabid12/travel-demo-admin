import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import Employee from "@/lib/models/Employee";
import Customer from "@/lib/models/Customer";
import { normalizeRole, type Role } from "@/lib/permissions";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Add it to .env.local — there is no fallback.",
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await dbConnect();

        const user = await Employee.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select("+password");
        if (!user || !user.isActive) {
          throw new Error("User not found or disabled");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
        };
      },
    }),
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await dbConnect();

        const user = await Customer.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select("+password");
        if (!user || !user.isActive) {
          throw new Error("Customer not found or disabled");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: "Customer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: Role }).role = normalizeRole(
          token.role as string,
        );
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  secret,
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role | "Customer";
};

/** Current session user in a Server Component or route handler, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as SessionUser;
  return { ...u, role: u.role === "Customer" ? "Customer" : normalizeRole(u.role) };
}
