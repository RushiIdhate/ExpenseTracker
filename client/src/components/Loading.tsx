export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading-state">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
