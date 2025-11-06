import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DowntimeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
}

const DOWNTIME_REASONS = [
  "Mechanical Failure",
  "Material Shortage",
  "Tool Changeover (Setup)",
  "Electrical Maintenance",
];

export default function DowntimeForm({ open, onClose, onSubmit }: DowntimeFormProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason, notes);
      setReason("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Report Downtime</DialogTitle>
          <DialogDescription>
            Select the reason for the line stoppage and add any relevant notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-medium">
              Downtime Reason
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="h-14" data-testid="select-downtime-reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {DOWNTIME_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Roller X broke..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-32 resize-none"
              data-testid="input-downtime-notes"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason}
            data-testid="button-submit-downtime"
          >
            Start Downtime
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
