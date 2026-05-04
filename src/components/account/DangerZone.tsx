import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CONFIRM_PHRASE = "delete my account";

export default function DangerZone() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const phraseMatches = confirmText.trim().toLowerCase() === CONFIRM_PHRASE;

  function openConfirm() {
    setConfirmText("");
    setConfirmOpen(true);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        toast.error("Not signed in");
        return;
      }

      const [reminders, shares, notifications, prefs, usage] = await Promise.all([
        supabase.from("reminders").select("*"),
        supabase.from("reminder_shares").select("*"),
        supabase.from("notification_log").select("*"),
        supabase.from("notification_preferences").select("*"),
        supabase.from("analysis_usage").select("*"),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email, created_at: user.created_at },
        reminders: reminders.data ?? [],
        reminder_shares: shares.data ?? [],
        notification_log: notifications.data ?? [],
        notification_preferences: prefs.data ?? [],
        analysis_usage: usage.data ?? [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unscreenshot-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (e) {
      console.error("Export failed", e);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
      });
      if (error || !data?.success) {
        toast.error("Account deletion failed");
        return;
      }
      await supabase.auth.signOut();
      navigate("/");
    } catch (e) {
      console.error("Delete failed", e);
      toast.error("Account deletion failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <h2 className="text-section-title mb-4">Data and account</h2>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-btn border border-border text-foreground hover:bg-muted transition-colors text-[15px] font-medium mb-3 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {exporting ? "Preparing export..." : "Export my data (JSON)"}
      </button>

      <button
        onClick={() => setConfirmOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-btn border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-[15px] font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Delete account
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your reminders, screenshots, shares, and
              notification history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
