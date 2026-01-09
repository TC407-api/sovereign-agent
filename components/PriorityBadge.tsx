type Priority = 'high' | 'medium' | 'normal';

const PRIORITY_CONFIG = {
  high: {
    emoji: '🔴',
    label: 'High',
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  medium: {
    emoji: '🟡',
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  normal: {
    emoji: '⚪',
    label: 'Normal',
    className: 'bg-slate-100 text-slate-600 border-slate-200'
  }
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      data-testid="priority-badge"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
