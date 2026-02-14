import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area offset by sidebar on desktop */}
      <div className="md:pl-64">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
