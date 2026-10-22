import { BrainCircuit, Cloud, ShieldCheck, Layers3, Code2, Network, Cpu } from 'lucide-react';
import './solutions-visual.css';

const nodes = [
  { Icon: BrainCircuit, x: 160, y: 40 },
  { Icon: Cloud, x: 264, y: 100 },
  { Icon: ShieldCheck, x: 264, y: 220 },
  { Icon: Layers3, x: 160, y: 280 },
  { Icon: Code2, x: 56, y: 220 },
  { Icon: Network, x: 56, y: 100 },
];

/** Decorative illustration of the same six solution categories as the adjacent cards. */
export function SolutionsVisual() {
  return (
    <div className="solutions-visual" aria-hidden="true">
      <svg viewBox="0 0 320 320" fill="none" focusable="false">
        <circle className="solutions-visual-orbit" cx="160" cy="160" r="120" />
        <circle
          className="solutions-visual-orbit solutions-visual-orbit-inner"
          cx="160"
          cy="160"
          r="82"
        />
        {nodes.map(({ Icon, x, y }, index) => (
          <g key={index} style={{ animationDelay: `${index * -0.6}s` }}>
            <path className="solutions-visual-link" d={`M160 160 L${x} ${y}`} />
            <path
              className="solutions-visual-signal"
              pathLength="100"
              d={`M160 160 L${x} ${y}`}
              style={{ animationDelay: `${index * -0.6}s` }}
            />
            <rect
              className="solutions-visual-node"
              x={x - 23}
              y={y - 23}
              width="46"
              height="46"
              rx="14"
            />
            <Icon
              x={x - 12}
              y={y - 12}
              width="24"
              height="24"
              strokeWidth="1.6"
              className="solutions-visual-icon"
            />
          </g>
        ))}
        <circle className="solutions-visual-halo" cx="160" cy="160" r="43" />
        <rect className="solutions-visual-core" x="129" y="129" width="62" height="62" rx="20" />
        <Cpu x="143" y="143" width="34" height="34" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
