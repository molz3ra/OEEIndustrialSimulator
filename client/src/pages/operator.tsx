import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatusButton from "@/components/StatusButton";
import DowntimeForm from "@/components/DowntimeForm";
import ActiveDowntimeDisplay from "@/components/ActiveDowntimeDisplay";
import { useToast } from "@/hooks/use-toast";

type DowntimeEvent = {
  id: number;
  reason: string;
  notes: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
};

export default function OperatorPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: activeEvent, isLoading } = useQuery<DowntimeEvent | null>({
    queryKey: ["/api/downtime/active"],
    refetchInterval: 5000,
  });

  const startDowntimeMutation = useMutation({
    mutationFn: async (data: { reason: string; notes: string }) => {
      return apiRequest("/api/downtime/start", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downtime/active"] });
      toast({
        title: "Downtime Started",
        description: "Line downtime event has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start downtime event.",
        variant: "destructive",
      });
    },
  });

  const endDowntimeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/downtime/${id}/end`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downtime/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/downtime"] });
      toast({
        title: "Line Back Up",
        description: "Downtime event has been resolved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to end downtime event.",
        variant: "destructive",
      });
    },
  });

  const handleLineDown = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = (reason: string, notes: string) => {
    startDowntimeMutation.mutate({ reason, notes });
    setIsFormOpen(false);
  };

  const handleLineUp = () => {
    if (activeEvent) {
      endDowntimeMutation.mutate(activeEvent.id);
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

        {activeEvent && (
          <ActiveDowntimeDisplay
            startTime={new Date(activeEvent.startTime)}
            reason={activeEvent.reason}
            notes={activeEvent.notes || ""}
          />
        )}

        <div className="flex flex-col items-center gap-6">
          {!activeEvent ? (
            <StatusButton
              status="down"
              onClick={handleLineDown}
              disabled={startDowntimeMutation.isPending || isLoading}
            />
          ) : (
            <StatusButton
              status="up"
              onClick={handleLineUp}
              disabled={endDowntimeMutation.isPending}
            />
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
