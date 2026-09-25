const inputLayer = [130, 220, 310];
const hiddenLayerOne = [90, 155, 220, 285, 350];
const hiddenLayerTwo = [115, 185, 255, 325];
const outputLayer = [165, 275];

function Connections({ fromX, from, toX, to }: { fromX: number; from: number[]; toX: number; to: number[] }) {
  return (
    <g stroke="var(--primary)" strokeOpacity="0.2" strokeWidth="1.25">
      {from.flatMap((fromY, fromIndex) =>
        to.map((toY, toIndex) => (
          <line key={`${fromIndex}-${toIndex}`} x1={fromX + 23} y1={fromY} x2={toX - 23} y2={toY} />
        )),
      )}
    </g>
  );
}

function LayerNodes({ x, values, labels, delay }: { x: number; values: number[]; labels?: string[]; delay: number }) {
  return (
    <g>
      {values.map((y, index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="23" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
          <circle
            className="neural-node-pulse"
            cx={x}
            cy={y}
            r="16"
            fill="var(--primary-soft)"
            stroke="var(--primary)"
            strokeOpacity="0.3"
            style={{ animationDelay: `${delay + index * 0.06}s` }}
          />
          {labels ? <text x={x} y={y + 5} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="700">{labels[index]}</text> : null}
        </g>
      ))}
    </g>
  );
}

export function NeuralNetworkDiagram() {
  return (
    <figure className="border border-border bg-card/65">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <span className="font-mono text-xs font-semibold text-primary">Fully connected neural network</span>
        <span className="hidden text-xs text-muted-foreground sm:block">3 inputs · 2 hidden layers · 2 outputs</span>
      </div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <svg className="h-auto w-full min-w-[650px]" viewBox="0 0 760 420" role="img" aria-labelledby="network-title network-desc">
          <title id="network-title">Sơ đồ một mạng neural fully connected</title>
          <desc id="network-desc">Ba neuron input kết nối tới hai hidden layer và hai neuron output. Mỗi đường nối đại diện cho một weight.</desc>

          <g fill="var(--ink)" fontSize="15" fontWeight="700" textAnchor="middle">
            <text x="80" y="36">Input layer</text>
            <text x="380" y="36">Hidden layers</text>
            <text x="680" y="36">Output layer</text>
          </g>
          <g fill="none" stroke="var(--primary)" strokeOpacity="0.7" strokeWidth="1.5">
            <path d="M278 61V48H482V61" />
          </g>

          <Connections fromX={80} from={inputLayer} toX={280} to={hiddenLayerOne} />
          <Connections fromX={280} from={hiddenLayerOne} toX={480} to={hiddenLayerTwo} />
          <Connections fromX={480} from={hiddenLayerTwo} toX={680} to={outputLayer} />

          <g className="neural-signal-path" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeDasharray="10 8">
            <path d="M103 130 257 155 457 185 657 165" />
          </g>

          <LayerNodes x={80} values={inputLayer} labels={['x₁', 'x₂', 'x₃']} delay={0} />
          <LayerNodes x={280} values={hiddenLayerOne} delay={0.8} />
          <LayerNodes x={480} values={hiddenLayerTwo} delay={1.6} />
          <LayerNodes x={680} values={outputLayer} labels={['ŷ₁', 'ŷ₂']} delay={2.4} />

          <g fill="var(--muted-foreground)" fontSize="12" textAnchor="middle">
            <text x="80" y="385">Feature đầu vào</text>
            <text x="280" y="385">5 neurons</text>
            <text x="480" y="385">4 neurons</text>
            <text x="680" y="385">Dự đoán</text>
          </g>
        </svg>
      </div>

      <figcaption className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        <div className="bg-surface px-4 py-3 text-xs leading-5"><strong className="text-ink">Node</strong><span className="text-muted-foreground"> · một neuron</span></div>
        <div className="bg-surface px-4 py-3 text-xs leading-5"><strong className="text-ink">Đường nối</strong><span className="text-muted-foreground"> · một weight</span></div>
        <div className="bg-surface px-4 py-3 font-mono text-xs leading-5 text-primary">Σ(weight × input) + bias → activation</div>
      </figcaption>
    </figure>
  );
}