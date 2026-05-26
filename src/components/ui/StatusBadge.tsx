interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  confirmado: { bg: 'bg-warning/10', text: 'text-warning', label: 'Confirmado' },
  em_preparo: { bg: 'bg-primary/10', text: 'text-primary', label: 'Em Preparo' },
  pronto: { bg: 'bg-success/10', text: 'text-success', label: 'Pronto' },
  entregue: { bg: 'bg-success/10', text: 'text-success', label: 'Entregue' },
  fechado: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Fechado' },
  cancelado: { bg: 'bg-error/10', text: 'text-error', label: 'Cancelado' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}