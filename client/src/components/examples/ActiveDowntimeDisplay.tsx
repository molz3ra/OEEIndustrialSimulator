import ActiveDowntimeDisplay from '../ActiveDowntimeDisplay';

export default function ActiveDowntimeDisplayExample() {
  const startTime = new Date(Date.now() - 125000);
  
  return (
    <div className="p-8 max-w-2xl">
      <ActiveDowntimeDisplay
        startTime={startTime}
        reason="Mechanical Failure"
        notes="Roller X broke, waiting for replacement"
      />
    </div>
  );
}
