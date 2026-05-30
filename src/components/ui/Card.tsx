interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl shadow-sm border border-border overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
