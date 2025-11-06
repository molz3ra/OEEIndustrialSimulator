import DowntimeForm from '../DowntimeForm';

export default function DowntimeFormExample() {
  return (
    <DowntimeForm
      open={true}
      onClose={() => console.log('Form closed')}
      onSubmit={(reason, notes) => console.log('Submitted:', { reason, notes })}
    />
  );
}
