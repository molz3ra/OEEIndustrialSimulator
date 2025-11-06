import DowntimeDistribution from '../DowntimeDistribution';

export default function DowntimeDistributionExample() {
  const mockData = [
    { reason: "Mechanical Failure", percentage: 41, color: "hsl(210, 85%, 32%)" },
    { reason: "Tool Changeover", percentage: 28, color: "hsl(28, 92%, 45%)" },
    { reason: "Material Shortage", percentage: 19, color: "hsl(142, 76%, 36%)" },
    { reason: "Electrical Maintenance", percentage: 12, color: "hsl(262, 83%, 58%)" },
  ];

  return (
    <div className="p-8 max-w-md">
      <DowntimeDistribution data={mockData} />
    </div>
  );
}
