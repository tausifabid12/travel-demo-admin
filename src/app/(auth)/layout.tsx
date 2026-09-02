import AdminSessionProvider from "@/components/admin/SessionProvider";
import { Toaster } from "@/components/ui";

export const metadata = {
  title: "Sign in | Bhancer Admin",
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <AdminSessionProvider>
      <div data-shell="admin" className="min-h-screen antialiased">
        {children}
      </div>
      <Toaster />
    </AdminSessionProvider>
  );
}
