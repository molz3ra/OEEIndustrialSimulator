import StatusButton from '../StatusButton';

export default function StatusButtonExample() {
  return (
    <div className="flex gap-4 p-8">
      <StatusButton status="down" onClick={() => console.log('Line Down clicked')} />
      <StatusButton status="up" onClick={() => console.log('Line Up clicked')} />
    </div>
  );
}
