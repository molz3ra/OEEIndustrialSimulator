import DowntimeChart from '../DowntimeChart';

export default function DowntimeChartExample() {
  const mockData = [
    { reason: "Mechanical Failure", duration: 145, count: 8 },
    { reason: "Tool Changeover (Setup)", duration: 98, count: 12 },
    { reason: "Material Shortage", duration: 67, count: 5 },
    { reason: "Electrical Maintenance", duration: 42, count: 3 },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <DowntimeChart data={mockData} />
    </div>
  );
}
