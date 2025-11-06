import DowntimeEventsTable from '../DowntimeEventsTable';

export default function DowntimeEventsTableExample() {
  const mockEvents = [
    {
      id: 1,
      timestamp: "2025-01-06 14:23",
      reason: "Mechanical Failure",
      duration: "00:45:12",
      notes: "Roller X broke, waiting for replacement",
      status: "active" as const,
    },
    {
      id: 2,
      timestamp: "2025-01-06 12:15",
      reason: "Tool Changeover (Setup)",
      duration: "00:18:34",
      notes: "Switching from part A to part B",
      status: "resolved" as const,
    },
    {
      id: 3,
      timestamp: "2025-01-06 09:42",
      reason: "Material Shortage",
      duration: "01:12:08",
      notes: "Waiting for steel delivery",
      status: "resolved" as const,
    },
    {
      id: 4,
      timestamp: "2025-01-06 07:30",
      reason: "Electrical Maintenance",
      duration: "00:25:45",
      notes: "Routine inspection",
      status: "resolved" as const,
    },
  ];

  return (
    <div className="p-8">
      <DowntimeEventsTable events={mockEvents} />
    </div>
  );
}
