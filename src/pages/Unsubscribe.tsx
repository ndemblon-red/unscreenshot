import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "valid" | "confirming" | "success" | "already" | "invalid" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    fetch(
      `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
      { headers: { apikey: anonKey } },
    )
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.valid) setState("valid");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("confirming");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) {
      setState("error");
      return;
    }
    if (data?.success) setState("success");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-foreground">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Unsubscribe</h1>

        {state === "loading" && (
          <p className="text-muted-foreground">Checking your link…</p>
        )}

        {state === "valid" && (
          <>
            <p className="text-muted-foreground mb-6">
              Confirm to stop receiving Unscreenshot emails at this address.
            </p>
            <Button onClick={confirm}>Confirm unsubscribe</Button>
          </>
        )}

        {state === "confirming" && (
          <p className="text-muted-foreground">Unsubscribing…</p>
        )}

        {state === "success" && (
          <p className="text-muted-foreground">
            You've been unsubscribed. You won't receive further emails from Unscreenshot at this address.
          </p>
        )}

        {state === "already" && (
          <p className="text-muted-foreground">This address is already unsubscribed.</p>
        )}

        {state === "invalid" && (
          <p className="text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}

        {state === "error" && (
          <>
            <p className="text-muted-foreground mb-6">
              Something went wrong. Please try again.
            </p>
            <Button variant="outline" onClick={() => location.reload()}>Retry</Button>
          </>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
