import { WifiOff, Loader2, CloudOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useEffect, useState } from "react";
import { flushQueue, getQueue, subscribeQueueCount } from "@/lib/save-queue";
import { toast } from "@/hooks/use-toast";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [flushing, setFlushing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Subscribe to queue count
  useEffect(() => subscribeQueueCount(setQueueCount), []);

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

  const showBanner = !isOnline || flushing;
  const showQueueBadge = queueCount > 0 && !flushing;

  if (!showBanner && !showQueueBadge) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground text-[13px] font-medium">
          {flushing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing {queueCount} queued reminder{queueCount !== 1 ? "s" : ""}…
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              You're offline
              {queueCount > 0 && ` — ${queueCount} reminder${queueCount !== 1 ? "s" : ""} queued`}
            </>
          )}
        </div>
      )}
      {showQueueBadge && !showBanner && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-muted border border-border text-[12px] font-medium text-muted-foreground shadow-sm">
          <CloudOff className="w-3.5 h-3.5" />
          {queueCount} queued
        </div>
      )}
    </>
  );
}
