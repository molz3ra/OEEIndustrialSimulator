import StatCard from '../StatCard';
import { Clock, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
      <StatCard title="Total Downtime" value="4.2h" icon={Clock} subtitle="Last 24 hours" />
      <StatCard title="Events Today" value="12" icon={Activity} />
      <StatCard title="Avg Duration" value="21m" icon={TrendingUp} />
      <StatCard title="Active Now" value="1" icon={AlertTriangle} />
    </div>
  );
}
