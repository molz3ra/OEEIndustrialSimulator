import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DowntimeEvent {
  id: number;
  timestamp: string;
  reason: string;
  duration: string;
  notes: string;
  status: "active" | "resolved";
}

interface DowntimeEventsTableProps {
  events: DowntimeEvent[];
}

export default function DowntimeEventsTable({ events }: DowntimeEventsTableProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Downtime Events</h3>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                  <TableCell className="font-mono text-sm">{event.timestamp}</TableCell>
                  <TableCell className="font-medium">{event.reason}</TableCell>
                  <TableCell className="font-mono">{event.duration}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {event.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === "active" ? "destructive" : "secondary"}
                      className={event.status === "active" ? "" : "bg-success text-success-foreground"}
                      data-testid={`badge-status-${event.id}`}
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
