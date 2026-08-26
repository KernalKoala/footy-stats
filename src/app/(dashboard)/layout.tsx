import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { QueryProvider } from "@/components/shared/query-provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <QueryProvider>
      <div className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <Navbar email={user?.email} />
        <main id="main-content" className="container py-6" role="main">
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
