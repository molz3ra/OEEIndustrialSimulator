import { useState } from "react";
import StatusButton from "@/components/StatusButton";
import DowntimeForm from "@/components/DowntimeForm";
import ActiveDowntimeDisplay from "@/components/ActiveDowntimeDisplay";

export default function OperatorPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeDowntime, setActiveDowntime] = useState<{
    startTime: Date;
    reason: string;
    notes: string;
  } | null>(null);

  const handleLineDown = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = (reason: string, notes: string) => {
    setActiveDowntime({
      startTime: new Date(),
      reason,
      notes,
    });
    setIsFormOpen(false);
  };

  const handleLineUp = () => {
    if (activeDowntime) {
      console.log("Line back up, downtime ended:", {
        ...activeDowntime,
        endTime: new Date(),
      });
      setActiveDowntime(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Line Downtime Reporting</h1>
          <p className="text-muted-foreground text-lg">
            Report production line status and downtime events
          </p>
        </div>

        {activeDowntime && (
          <ActiveDowntimeDisplay
            startTime={activeDowntime.startTime}
            reason={activeDowntime.reason}
            notes={activeDowntime.notes}
          />
        )}

        <div className="flex flex-col items-center gap-6">
          {!activeDowntime ? (
            <StatusButton status="down" onClick={handleLineDown} />
          ) : (
            <StatusButton status="up" onClick={handleLineUp} />
          )}
        </div>

        <DowntimeForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
}
