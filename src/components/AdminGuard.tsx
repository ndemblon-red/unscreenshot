import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Client-side gate. The real enforcement lives in the admin-stats edge
// function, which checks the email allowlist server-side. This guard
// just avoids rendering the empty page shell for non-admins.
const ADMIN_EMAILS = new Set(["ndemblon@gmail.com"]);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  const email = (session.user.email ?? "").toLowerCase();
  if (!ADMIN_EMAILS.has(email)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
