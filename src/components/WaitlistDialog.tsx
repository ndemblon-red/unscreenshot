import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WAITLIST_MAILTO = "mailto:waitlist@unscreenshot.ai?subject=Unscreenshot%20waitlist";

export default function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-card">
        <DialogHeader>
          <DialogTitle>You've reached the beta limit</DialogTitle>
          <DialogDescription>
            Thanks for trying Unscreenshot. The beta is capped at 30 analyses per
            person while we finalise pricing. Join the waitlist for early access
            to paid plans.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={() => {
              onOpenChange(false);
              navigate("/app");
            }}
            className="text-[15px] text-muted-foreground hover:text-foreground transition-colors px-3 py-2.5"
          >
            Back to reminders
          </button>
          <a
            href={WAITLIST_MAILTO}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity text-center"
          >
            Join waitlist
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
