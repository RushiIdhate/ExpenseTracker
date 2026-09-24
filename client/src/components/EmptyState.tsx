interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

export function EmptyState({ icon = 'bi-inbox', title, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
