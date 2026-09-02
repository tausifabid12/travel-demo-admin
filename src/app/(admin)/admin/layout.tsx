import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import AdminSessionProvider from "@/components/admin/SessionProvider";
import { Toaster } from "@/components/ui";

export const metadata = {
  title: "Admin Dashboard | Bhancer",
  description: "Content Management System for Bhancer",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminSessionProvider>
      <div data-shell="admin" className="flex min-h-screen antialiased">
        <Sidebar />
        <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
          <Header />
          <main className="p-6 lg:p-8 flex-1">{children}</main>
        </div>
      </div>
      <Toaster />
    </AdminSessionProvider>
  );
}
