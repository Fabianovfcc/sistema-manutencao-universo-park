import type { ReactNode } from 'react';

interface Props {
  label: string;
  color: string;
  count: number;
  children: ReactNode;
}

export default function Column({ label, color, count, children }: Props) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span className="kanban-dot" style={{ background: color }} />
        <span className="kanban-column-title">{label}</span>
        <span className="kanban-column-count">{count}</span>
      </div>
      <div className="kanban-column-body">{children}</div>
    </div>
  );
}
