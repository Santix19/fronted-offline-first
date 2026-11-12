const INPUTS = [
  { label: 'Lectura de agua', x: 8, y: 18 },
  { label: 'Mortalidad', x: 168, y: 18 },
  { label: 'Alimentación', x: 8, y: 70 },
  { label: 'Conteo', x: 168, y: 70 },
];

/**
 * The signature drawing of the style: fine connector paths, labelled capsules and a few small
 * signals over a soft glow. Here it is also true: four kinds of record go into the phone and
 * leave for the server together. The markup is the finished state; the timeline sends the dots.
 */
export function StoryDiagram() {
  return (
    <div className="story-diagram" aria-hidden="true">
      <div className="diagram-glow" />
      <svg viewBox="0 0 320 340" className="diagram-svg">
        {INPUTS.map((node, i) => (
          <g key={node.label}>
            <path id={`route-${i}`} className="diagram-path" pathLength={1} d={`M${node.x + 72} ${node.y + 32} C ${node.x + 72} 130, 160 120, 160 170`} />
            <rect className="diagram-capsule" x={node.x} y={node.y} width="144" height="32" rx="16" />
            <text className="diagram-label" x={node.x + 72} y={node.y + 20} textAnchor="middle">{node.label}</text>
            <circle id={`dot-${i}`} className="diagram-dot" r="4" cx={node.x + 72} cy={node.y + 32} />
          </g>
        ))}
        <path id="route-out" className="diagram-path" pathLength={1} d="M160 218 L160 292" />
        <g className="diagram-core">
          <rect x="136" y="164" width="48" height="48" rx="12" transform="rotate(45 160 188)" className="diagram-diamond back" />
          <rect x="140" y="168" width="40" height="40" rx="10" transform="rotate(45 160 188)" className="diagram-diamond" />
          <text className="diagram-label" x="160" y="192" textAnchor="middle">Celular</text>
        </g>
        <rect className="diagram-capsule" x="96" y="292" width="128" height="32" rx="16" />
        <text className="diagram-label" x="160" y="312" textAnchor="middle">Servidor</text>
        <circle id="dot-out" className="diagram-dot" r="4" cx="160" cy="218" />
      </svg>
    </div>
  );
}
