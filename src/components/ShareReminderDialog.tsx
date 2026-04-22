import { useEffect, useState } from "react";
import { Share2, X, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_RECIPIENTS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ShareRow = {
  id: string;
  recipient_email: string;
  created_at: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderId: string;
}

export default function ShareReminderDialog({ open, onOpenChange, reminderId }: Props) {
  const [activeShares, setActiveShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load existing active shares whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setPendingEmails([]);
    setInput("");
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reminder_shares")
        .select("id, recipient_email, created_at")
        .eq("reminder_id", reminderId)
        .is("revoked_at", null)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error("Couldn't load existing shares");
        console.error(error);
      } else {
        setActiveShares(data ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, reminderId]);

  const remainingSlots = MAX_RECIPIENTS - activeShares.length - pendingEmails.length;

  const addEmail = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (!EMAIL_RE.test(trimmed)) {
      toast.error("Enter a valid email");
      return;
    }
    if (pendingEmails.includes(trimmed)) {
      toast.error("Already added");
      return;
    }
    if (activeShares.some((s) => s.recipient_email === trimmed)) {
      toast.error("Already shared with this email");
      return;
    }
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_RECIPIENTS} recipients per reminder`);
      return;
    }
    setPendingEmails((prev) => [...prev, trimmed]);
    setInput("");
  };

  const removePending = (email: string) => {
    setPendingEmails((prev) => prev.filter((e) => e !== email));
  };

  const revokeShare = async (share: ShareRow) => {
    const { error } = await supabase
      .from("reminder_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", share.id);
    if (error) {
      toast.error("Couldn't revoke share");
      console.error(error);
      return;
    }
    setActiveShares((prev) => prev.filter((s) => s.id !== share.id));
    toast.success(`Stopped sharing with ${share.recipient_email}`);
  };

  const handleSubmit = async () => {
    if (pendingEmails.length === 0) {
      toast.error("Add at least one email");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("share-reminder", {
      body: { reminderId, recipientEmails: pendingEmails },
    });
    setSubmitting(false);

    if (error) {
      // Edge function returned non-2xx; surface the message it sent.
      const message =
        (data as { error?: string } | null)?.error ||
        error.message ||
        "Couldn't share reminder";
      toast.error(typeof message === "string" ? message : "Couldn't share reminder");
      return;
    }

    const shared = (data as { shared?: number })?.shared ?? 0;
    const skipped = (data as { skipped?: number })?.skipped ?? 0;
    if (shared > 0) {
      toast.success(
        skipped > 0
          ? `Shared with ${shared} (skipped ${skipped} already shared)`
          : `Shared with ${shared} ${shared === 1 ? "person" : "people"}`,
      );
    } else {
      toast.message("All recipients were already shared");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="w-4 h-4" />
            Share reminder
          </DialogTitle>
          <DialogDescription>
            We'll email them now and again when the reminder is due. Up to {MAX_RECIPIENTS} people per reminder.
          </DialogDescription>
        </DialogHeader>

        {/* Add new emails */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 rounded-btn border border-border bg-card text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={submitting || remainingSlots <= 0}
            />
            <button
              type="button"
              onClick={addEmail}
              disabled={submitting || remainingSlots <= 0}
              className="px-3 py-2 rounded-btn text-label bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {remainingSlots} of {MAX_RECIPIENTS} slots remaining
          </p>

          {pendingEmails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-primary/10 text-primary text-xs"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removePending(email)}
                    className="hover:opacity-70"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active shares */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-label text-muted-foreground">Currently shared with</p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : activeShares.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active shares</p>
          ) : (
            <ul className="space-y-1">
              {activeShares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="truncate">{share.recipient_email}</span>
                  <button
                    type="button"
                    onClick={() => revokeShare(share)}
                    className="ml-2 p-1.5 rounded-btn text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Revoke share with ${share.recipient_email}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-btn text-label text-muted-foreground hover:bg-muted transition-colors"
            disabled={submitting}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || pendingEmails.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Share
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
