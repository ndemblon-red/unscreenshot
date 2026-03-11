import { WifiOff, Loader2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useEffect, useState, useCallback } from "react";
import { flushQueue, getQueue } from "@/lib/save-queue";
import { toast } from "@/hooks/use-toast";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [flushing, setFlushing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Track transitions
  useEffect(() => {
    if (!isOnline) setWasOffline(true);
  }, [isOnline]);

  // Auto-flush when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      const pending = getQueue();
      if (pending.length > 0) {
        setFlushing(true);
        flushQueue().then(({ saved, failed }) => {
          setFlushing(false);
          setWasOffline(false);
          if (saved > 0) {
            toast({ title: `${saved} queued reminder${saved > 1 ? "s" : ""} saved` });
          }
          if (failed > 0) {
            toast({ title: `${failed} reminder${failed > 1 ? "s" : ""} failed to save`, variant: "destructive" });
          }
        });
      } else {
        setWasOffline(false);
      }
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !flushing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground text-[13px] font-medium">
      {flushing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Syncing queued reminders…
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          You're offline — saves will be queued until you reconnect
        </>
      )}
    </div>
  );
}
