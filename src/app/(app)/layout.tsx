import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/");

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 overflow-x-hidden min-w-0">{children}</main>
      <Toaster />
    </div>
  );
}
