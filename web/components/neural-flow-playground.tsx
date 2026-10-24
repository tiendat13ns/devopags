'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const hiddenWeights = [
  [0.8, -0.4],
  [-0.6, 1.1],
  [0.5, 0.7],
];
const hiddenBiases = [0.1, -0.2, 0];
const outputWeights = [
  [1.2, -0.7, 0.4],
  [-0.5, 0.9, 0.8],
];
const outputBiases = [-0.1, 0.05];
const stepLabels = [
  'Dữ liệu thô',
  'Chuẩn hóa',
  'Tổng có trọng số',
  'ReLU',
  'Dự đoán',
];

type SelectedNode = {
  layer: 'input' | 'hidden-z' | 'hidden-a' | 'output';
  index: number;
};
type Calculation = {
  inputs: number[];
  hiddenZ: number[];
  hiddenA: number[];
  logits: number[];
  probabilities: number[];
};

const round = (value: number) => Number(value.toFixed(3));
const relu = (value: number) => Math.max(0, value);

function softmax(values: number[]) {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

export function NeuralFlowPlayground() {
  const [requestRate, setRequestRate] = useState(720);
  const [errorRate, setErrorRate] = useState(18);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNode>({
    layer: 'hidden-a',
    index: 0,
  });

  const calculation = useMemo<Calculation>(() => {
    const inputs = [(requestRate - 500) / 500, errorRate / 100];
    const hiddenZ = hiddenWeights.map((weights, index) =>
      weights.reduce(
        (sum, weight, inputIndex) => sum + weight * inputs[inputIndex],
        hiddenBiases[index],
      ),
    );
    const hiddenA = hiddenZ.map(relu);
    const logits = outputWeights.map((weights, index) =>
      weights.reduce(
        (sum, weight, hiddenIndex) => sum + weight * hiddenA[hiddenIndex],
        outputBiases[index],
      ),
    );
    const probabilities = softmax(logits);
    return { inputs, hiddenZ, hiddenA, logits, probabilities };
  }, [errorRate, requestRate]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= stepLabels.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  function reset() {
    setStep(0);
    setIsPlaying(false);
    setRequestRate(720);
    setErrorRate(18);
  }

  function nextStep() {
    setIsPlaying(false);
    setStep((current) => (current + 1) % stepLabels.length);
  }

  const prediction =
    calculation.probabilities[1] >= calculation.probabilities[0]
      ? 'Có sự cố'
      : 'Bình thường';
  const confidence = Math.max(...calculation.probabilities);

  return (
    <section
      className="overflow-hidden border border-border bg-card/55"
      aria-label="Mô phỏng mạng neural"
    >
      <div className="grid border-b border-border xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <ControlPanel
          requestRate={requestRate}
          errorRate={errorRate}
          onRequestRateChange={(value) => {
            setRequestRate(value);
            setStep(0);
            setIsPlaying(false);
          }}
          onErrorRateChange={(value) => {
            setErrorRate(value);
            setStep(0);
            setIsPlaying(false);
          }}
        />

        <div className="min-w-0 border-y border-border p-4 sm:p-6 xl:border-x xl:border-y-0">
          <StepRail current={step} />
          <NetworkDiagram
            calculation={calculation}
            step={step}
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setIsPlaying((current) => !current)}
              >
                {isPlaying ? <Pause /> : <Play />}{' '}
                {isPlaying ? 'Tạm dừng' : 'Tự chạy'}
              </Button>
              <Button type="button" variant="outline" onClick={nextStep}>
                <StepForward /> Bước tiếp
              </Button>
              <Button type="button" variant="ghost" onClick={reset}>
                <RotateCcw /> Đặt lại
              </Button>
            </div>
            <span
              className="font-mono text-sm font-semibold text-primary"
              aria-live="polite"
            >
              Bước {step + 1}/{stepLabels.length} · {stepLabels[step]}
            </span>
          </div>
        </div>

        <Inspector
          calculation={calculation}
          confidence={confidence}
          prediction={prediction}
          selectedNode={selectedNode}
          step={step}
        />
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-3">
        <LegendItem
          mark="●"
          label="Độ sáng node"
          description="Giá trị activation"
        />
        <LegendItem
          mark="━"
          label="Độ dày cạnh"
          description="Độ lớn của weight"
        />
        <LegendItem
          mark="+/−"
          label="Dấu của cạnh"
          description="Weight dương hoặc âm"
        />
      </div>
    </section>
  );
}

function ControlPanel({
  requestRate,
  errorRate,
  onRequestRateChange,
  onErrorRateChange,
}: {
  requestRate: number;
  errorRate: number;
  onRequestRateChange: (value: number) => void;
  onErrorRateChange: (value: number) => void;
}) {
  return (
    <aside className="bg-background/45 p-5">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
        01 · Input
      </p>
      <h2 className="mt-2 text-lg font-bold text-ink">Tín hiệu hệ thống</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Hai chỉ số thô được biến đổi thành vector trước khi đi vào mạng.
      </p>

      <label className="mt-7 block text-sm font-semibold text-ink">
        Request/phút{' '}
        <span className="float-right font-mono text-primary">
          {requestRate}
        </span>
      </label>
      <Slider
        className="mt-3"
        min={0}
        max={1000}
        step={10}
        value={[requestRate]}
        onValueChange={(value) =>
          onRequestRateChange(typeof value === 'number' ? value : value[0])
        }
        aria-label="Số request mỗi phút"
      />

      <label className="mt-7 block text-sm font-semibold text-ink">
        Error rate{' '}
        <span className="float-right font-mono text-primary">{errorRate}%</span>
      </label>
      <Slider
        className="mt-3"
        min={0}
        max={100}
        step={1}
        value={[errorRate]}
        onValueChange={(value) =>
          onErrorRateChange(typeof value === 'number' ? value : value[0])
        }
        aria-label="Tỷ lệ lỗi phần trăm"
      />

      <div className="mt-8 border-l-2 border-primary pl-3">
        <p className="font-mono text-xs text-muted-foreground">
          VECTOR SAU CHUẨN HÓA
        </p>
        <code className="mt-2 block font-mono text-base font-semibold text-primary">
          [({requestRate}−500)/500, {errorRate}/100]
        </code>
      </div>
    </aside>
  );
}

function StepRail({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Các bước xử lý">
      {stepLabels.map((label, index) => (
        <li className="min-w-0" key={label}>
          <div
            className={`h-1.5 transition-colors ${index <= current ? 'bg-primary' : 'bg-muted'}`}
            aria-hidden="true"
          />
          <span
            className={`mt-2 hidden truncate text-xs font-semibold sm:block ${index === current ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function NetworkDiagram({
  calculation,
  step,
  selectedNode,
  onSelect,
}: {
  calculation: Calculation;
  step: number;
  selectedNode: SelectedNode;
  onSelect: (node: SelectedNode) => void;
}) {
  const inputYs = [145, 265];
  const hiddenYs = [95, 205, 315];
  const outputYs = [145, 265];
  const inputX = 100;
  const hiddenX = 350;
  const outputX = 600;

  return (
    <div className="mt-3 overflow-x-auto">
      <svg
        className="h-auto min-w-[700px] w-full"
        viewBox="0 0 700 390"
        aria-label="Mạng neural hai đầu vào, ba neuron ẩn và hai đầu ra"
        aria-labelledby="neural-flow-title neural-flow-description"
      >
        <title id="neural-flow-title">
          Mạng neural hai đầu vào, ba neuron ẩn và hai đầu ra
        </title>
        <desc id="neural-flow-description">
          Các cạnh thể hiện trọng số. Nhấn vào một neuron để xem phép tính chi
          tiết.
        </desc>

        <g
          fill="var(--muted-foreground)"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
        >
          <text x={inputX} y="38">
            Input vector
          </text>
          <text x={hiddenX} y="38">
            Hidden · ReLU
          </text>
          <text x={outputX} y="38">
            Softmax output
          </text>
        </g>

        <g
          opacity={step >= 2 ? 1 : 0.18}
          className="transition-opacity duration-500"
        >
          {inputYs.flatMap((sourceY, inputIndex) =>
            hiddenYs.map((targetY, hiddenIndex) => {
              const weight = hiddenWeights[hiddenIndex][inputIndex];
              return (
                <g key={`ih-${inputIndex}-${hiddenIndex}`}>
                  <line
                    x1={inputX + 27}
                    y1={sourceY}
                    x2={hiddenX - 27}
                    y2={targetY}
                    stroke={
                      weight >= 0 ? 'var(--primary)' : 'var(--destructive)'
                    }
                    strokeOpacity={0.42}
                    strokeWidth={1 + Math.abs(weight) * 2.2}
                  />
                  <text
                    x={(inputX + hiddenX) / 2}
                    y={(sourceY + targetY) / 2 - 5}
                    fill="var(--muted-foreground)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {weight > 0 ? '+' : '−'}
                  </text>
                </g>
              );
            }),
          )}
        </g>

        <g
          opacity={step >= 4 ? 1 : 0.18}
          className="transition-opacity duration-500"
        >
          {hiddenYs.flatMap((sourceY, hiddenIndex) =>
            outputYs.map((targetY, outputIndex) => {
              const weight = outputWeights[outputIndex][hiddenIndex];
              return (
                <line
                  key={`ho-${hiddenIndex}-${outputIndex}`}
                  x1={hiddenX + 27}
                  y1={sourceY}
                  x2={outputX - 27}
                  y2={targetY}
                  stroke={weight >= 0 ? 'var(--primary)' : 'var(--destructive)'}
                  strokeOpacity={0.42}
                  strokeWidth={1 + Math.abs(weight) * 2.2}
                />
              );
            }),
          )}
        </g>

        {calculation.inputs.map((value, index) => (
          <NodeButton
            key={`input-${index}`}
            x={inputX}
            y={inputYs[index]}
            label={`x${index + 1}`}
            value={step >= 1 ? value : undefined}
            intensity={Math.abs(value)}
            active={
              selectedNode.layer === 'input' && selectedNode.index === index
            }
            visible={step >= 1}
            onClick={() => onSelect({ layer: 'input', index })}
          />
        ))}

        {calculation.hiddenA.map((value, index) => (
          <NodeButton
            key={`hidden-${index}`}
            x={hiddenX}
            y={hiddenYs[index]}
            label={`h${index + 1}`}
            value={
              step >= 3
                ? value
                : step >= 2
                  ? calculation.hiddenZ[index]
                  : undefined
            }
            intensity={step >= 3 ? value : Math.abs(calculation.hiddenZ[index])}
            active={
              (selectedNode.layer === 'hidden-a' ||
                selectedNode.layer === 'hidden-z') &&
              selectedNode.index === index
            }
            visible={step >= 2}
            onClick={() =>
              onSelect({ layer: step >= 3 ? 'hidden-a' : 'hidden-z', index })
            }
          />
        ))}

        {calculation.probabilities.map((value, index) => (
          <NodeButton
            key={`output-${index}`}
            x={outputX}
            y={outputYs[index]}
            label={index === 0 ? 'OK' : 'ERR'}
            value={step >= 4 ? value : undefined}
            intensity={value}
            active={
              selectedNode.layer === 'output' && selectedNode.index === index
            }
            visible={step >= 4}
            percent
            onClick={() => onSelect({ layer: 'output', index })}
          />
        ))}

        <g fill="var(--muted-foreground)" fontSize="11" textAnchor="middle">
          <text x={inputX} y="365">
            2 features
          </text>
          <text x={hiddenX} y="365">
            3 activations
          </text>
          <text x={outputX} y="365">
            2 classes
          </text>
        </g>
      </svg>
    </div>
  );
}

function NodeButton({
  x,
  y,
  label,
  value,
  intensity,
  active,
  visible,
  percent = false,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  value?: number;
  intensity: number;
  active: boolean;
  visible: boolean;
  percent?: boolean;
  onClick: () => void;
}) {
  const opacity = visible
    ? 0.14 + Math.min(1, Math.abs(intensity)) * 0.72
    : 0.04;

  return (
    <a
      href="#neural-flow-inspector"
      aria-label={`${label}: ${value === undefined ? 'chưa tính' : value.toFixed(3)}`}
      onClick={onClick}
      className="cursor-pointer outline-none focus-visible:[&_circle:last-of-type]:stroke-[3]"
    >
      <circle
        cx={x}
        cy={y}
        r={active ? 31 : 27}
        fill="var(--primary)"
        opacity={opacity}
        className="transition-all duration-500"
      />
      <circle
        cx={x}
        cy={y}
        r="27"
        fill="none"
        stroke={active ? 'var(--primary)' : 'var(--border)'}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <text
        x={x}
        y={y - 3}
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize="12"
        fontWeight="700"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        fill="var(--primary)"
        fontSize="10"
        fontWeight="600"
      >
        {value === undefined
          ? '—'
          : percent
            ? `${Math.round(value * 100)}%`
            : round(value)}
      </text>
    </a>
  );
}

function Inspector({
  calculation,
  confidence,
  prediction,
  selectedNode,
  step,
}: {
  calculation: Calculation;
  confidence: number;
  prediction: string;
  selectedNode: SelectedNode;
  step: number;
}) {
  const detail = getNodeDetail(selectedNode, calculation);
  return (
    <aside id="neural-flow-inspector" className="bg-background/45 p-5">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
        03 · Inspector
      </p>
      <h2 className="mt-2 text-lg font-bold text-ink">Bên trong phép tính</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Chọn một node trên sơ đồ để xem giá trị và công thức của nó.
      </p>

      <div className="mt-6 border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink">{detail.title}</span>
          <code className="font-mono text-sm font-bold text-primary">
            {round(detail.value)}
          </code>
        </div>
        <code className="mt-4 block break-words font-mono text-sm leading-6 text-muted-foreground">
          {detail.formula}
        </code>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {detail.note}
        </p>
      </div>

      <div
        className={`mt-5 border-l-2 pl-4 transition-opacity ${step >= 4 ? 'border-primary opacity-100' : 'border-border opacity-45'}`}
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">Kết quả hiện tại</p>
        <p className="mt-1 text-xl font-bold text-ink">
          {step >= 4 ? prediction : 'Chưa dự đoán'}
        </p>
        <p className="mt-1 font-mono text-sm text-primary">
          confidence {step >= 4 ? `${Math.round(confidence * 100)}%` : '—'}
        </p>
      </div>
    </aside>
  );
}

function getNodeDetail(selected: SelectedNode, calculation: Calculation) {
  if (selected.layer === 'input') {
    const labels = ['Request rate đã chuẩn hóa', 'Error rate đã chuẩn hóa'];
    const formulas = ['(request − 500) / 500', 'error rate / 100'];
    return {
      title: `Input x${selected.index + 1}`,
      value: calculation.inputs[selected.index],
      formula: formulas[selected.index],
      note: labels[selected.index],
    };
  }
  if (selected.layer === 'output') {
    return {
      title: selected.index === 0 ? 'P(Bình thường)' : 'P(Có sự cố)',
      value: calculation.probabilities[selected.index],
      formula: `softmax([${calculation.logits.map(round).join(', ')}])`,
      note: 'Softmax biến logits thành phân phối xác suất có tổng bằng 1.',
    };
  }
  const index = selected.index;
  const weightedParts = hiddenWeights[index]
    .map(
      (weight, inputIndex) =>
        `${weight}×${round(calculation.inputs[inputIndex])}`,
    )
    .join(' + ');
  if (selected.layer === 'hidden-z') {
    return {
      title: `Tổng z${index + 1}`,
      value: calculation.hiddenZ[index],
      formula: `${weightedParts} + ${hiddenBiases[index]}`,
      note: 'Neuron cộng các input đã nhân weight rồi thêm bias.',
    };
  }
  return {
    title: `Activation h${index + 1}`,
    value: calculation.hiddenA[index],
    formula: `ReLU(${round(calculation.hiddenZ[index])}) = max(0, z)`,
    note:
      calculation.hiddenZ[index] < 0
        ? 'ReLU chặn giá trị âm nên activation bằng 0.'
        : 'Giá trị dương được ReLU truyền tiếp.',
  };
}

function LegendItem({
  mark,
  label,
  description,
}: {
  mark: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-background px-5 py-3">
      <span
        className="font-mono text-lg font-bold text-primary"
        aria-hidden="true"
      >
        {mark}
      </span>
      <p className="text-sm">
        <strong className="text-ink">{label}</strong>
        <span className="text-muted-foreground"> · {description}</span>
      </p>
    </div>
  );
}
