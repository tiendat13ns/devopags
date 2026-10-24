'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const digitPatterns = [
  ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  ['01110', '11011', '00011', '00110', '01100', '11000', '11111'],
  ['11110', '00011', '00011', '01110', '00011', '00011', '11110'],
  ['00011', '00111', '01111', '11011', '11111', '00011', '00011'],
  ['11111', '11000', '11000', '11110', '00011', '00011', '11110'],
  ['01110', '11000', '11000', '11110', '11011', '11011', '01110'],
  ['11111', '00011', '00110', '00110', '01100', '01100', '01100'],
  ['01110', '11011', '11011', '01110', '11011', '11011', '01110'],
  ['01110', '11011', '11011', '01111', '00011', '00011', '01110'],
];

const verticalKernel = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const horizontalKernel = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

const stages = [
  {
    name: 'Input',
    shape: '16 × 16',
    note: 'Ảnh xám được biểu diễn bằng ma trận pixel từ 0 đến 1.',
  },
  {
    name: 'Conv 1 + ReLU',
    shape: '14 × 14',
    note: 'Kernel Sobel dọc phản ứng với các cạnh theo chiều dọc.',
  },
  {
    name: 'MaxPool 1',
    shape: '7 × 7',
    note: 'Mỗi vùng 2 × 2 giữ lại activation lớn nhất.',
  },
  {
    name: 'Conv 2 + ReLU',
    shape: '5 × 5',
    note: 'Kernel thứ hai tìm cạnh ngang trên feature map đã rút gọn.',
  },
  {
    name: 'MaxPool 2',
    shape: '2 × 2',
    note: 'Không gian được nén còn bốn đặc trưng nổi bật.',
  },
  {
    name: 'Flatten',
    shape: '4 values',
    note: 'Feature map 2D được trải thành vector cho classifier.',
  },
  {
    name: 'Softmax',
    shape: '10 classes',
    note: 'Các score cuối được chuẩn hóa thành xác suất của 10 chữ số.',
  },
];

type Matrix = number[][];

function createDigitMatrix(digit: number): Matrix {
  const matrix = Array.from({ length: 16 }, () => Array(16).fill(0));
  digitPatterns[digit].forEach((row, rowIndex) => {
    row.split('').forEach((pixel, columnIndex) => {
      if (pixel === '0') return;
      for (let y = 0; y < 2; y += 1) {
        for (let x = 0; x < 2; x += 1) {
          matrix[rowIndex * 2 + y + 1][columnIndex * 2 + x + 3] = 1;
        }
      }
    });
  });
  return matrix;
}

function convolveRelu(matrix: Matrix, kernel: Matrix): Matrix {
  const size = matrix.length - kernel.length + 1;
  const raw = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      kernel.reduce(
        (sum, kernelRow, kernelY) =>
          sum +
          kernelRow.reduce(
            (rowSum, weight, kernelX) =>
              rowSum + weight * matrix[row + kernelY][column + kernelX],
            0,
          ),
        0,
      ),
    ),
  );
  const max = Math.max(...raw.flat().map((value) => Math.max(0, value)), 1);
  return raw.map((row) => row.map((value) => Math.max(0, value) / max));
}

function maxPool(matrix: Matrix): Matrix {
  const size = Math.floor(matrix.length / 2);
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      Math.max(
        matrix[row * 2][column * 2],
        matrix[row * 2][column * 2 + 1],
        matrix[row * 2 + 1][column * 2],
        matrix[row * 2 + 1][column * 2 + 1],
      ),
    ),
  );
}

function predictionFor(digit: number, energy: number) {
  const raw = Array.from({ length: 10 }, (_, index) =>
    index === digit
      ? 0.78 + energy * 0.12
      : 0.012 + (((index * 7 + digit * 3) % 5) + 1) * 0.006,
  );
  const total = raw.reduce((sum, value) => sum + value, 0);
  return raw.map((value) => value / total);
}

export function CnnDigitPlayground() {
  const [digit, setDigit] = useState(7);
  const [stage, setStage] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const pipeline = useMemo(() => {
    const input = createDigitMatrix(digit);
    const conv1 = convolveRelu(input, verticalKernel);
    const pool1 = maxPool(conv1);
    const conv2 = convolveRelu(pool1, horizontalKernel);
    const pool2 = maxPool(conv2);
    const flattened = pool2.flat();
    const energy =
      flattened.reduce((sum, value) => sum + value, 0) / flattened.length;
    const probabilities = predictionFor(digit, energy);
    return { input, conv1, pool1, conv2, pool2, flattened, probabilities };
  }, [digit]);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current >= stages.length - 1) {
          setIsProcessing(false);
          return current;
        }
        return current + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isProcessing]);

  function selectDigit(nextDigit: number) {
    setDigit(nextDigit);
    setStage(-1);
    setIsProcessing(false);
  }

  function process() {
    if (stage >= stages.length - 1) setStage(-1);
    setIsProcessing(true);
  }

  function reset() {
    setDigit(7);
    setStage(-1);
    setIsProcessing(false);
  }

  const visibleStage = Math.max(stage, 0);
  const bestProbability = pipeline.probabilities[digit];

  return (
    <section className="space-y-5" aria-label="CNN visualizer nhận dạng chữ số">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <section
          className="border border-border bg-card/60 p-5 sm:p-6"
          aria-labelledby="digit-samples-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
                01 · Dữ liệu đầu vào
              </p>
              <h2
                id="digit-samples-heading"
                className="mt-2 text-xl font-bold text-ink"
              >
                Chọn một chữ số
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mỗi mẫu là ma trận ảnh xám 16 × 16 được đưa qua cùng một
                pipeline CNN.
              </p>
            </div>
            <span className="border border-primary/25 bg-primary-soft px-3 py-1.5 font-mono text-sm font-bold text-primary">
              digit {digit}
            </span>
          </div>

          <div
            className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10"
            aria-label="Các mẫu chữ số từ 0 đến 9"
          >
            {digitPatterns.map((_, sampleDigit) => {
              const selected = sampleDigit === digit;
              return (
                <button
                  className={`group flex min-w-0 flex-col items-center gap-2 border p-2 transition-colors ${
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary/55 hover:bg-accent'
                  }`}
                  type="button"
                  onClick={() => selectDigit(sampleDigit)}
                  aria-pressed={selected}
                  key={sampleDigit}
                >
                  <PixelMap
                    matrix={createDigitMatrix(sampleDigit)}
                    compact
                    invert={selected}
                    label={`Mẫu chữ số ${sampleDigit}`}
                  />
                  <span className="font-mono text-sm font-bold">
                    {sampleDigit}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={process} disabled={isProcessing}>
              {isProcessing ? <Pause /> : <Play />}{' '}
              {isProcessing
                ? 'Đang xử lý'
                : stage >= stages.length - 1
                  ? 'Chạy lại'
                  : 'Xử lý ảnh'}
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw /> Đặt lại
            </Button>
            <span
              className="ml-auto font-mono text-xs font-semibold text-muted-foreground"
              aria-live="polite"
            >
              {stage < 0
                ? 'Sẵn sàng'
                : `${stages[visibleStage].name} · ${stages[visibleStage].shape}`}
            </span>
          </div>
        </section>

        <section
          className="border border-border bg-card/60 p-5 sm:p-6"
          aria-labelledby="prediction-heading"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
                03 · Output
              </p>
              <h2
                id="prediction-heading"
                className="mt-2 text-xl font-bold text-ink"
              >
                Xác suất dự đoán
              </h2>
            </div>
            <div
              className={`text-right transition-opacity ${stage >= 6 ? 'opacity-100' : 'opacity-35'}`}
            >
              <p className="text-xs text-muted-foreground">Kết quả</p>
              <p className="font-mono text-lg font-bold text-primary">
                {stage >= 6
                  ? `${digit} · ${Math.round(bestProbability * 100)}%`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {pipeline.probabilities.map((probability, index) => {
              const shown = stage >= 6 ? probability : 0;
              const winner = stage >= 6 && index === digit;
              return (
                <div
                  className="grid grid-cols-[20px_minmax(0,1fr)_48px] items-center gap-2"
                  key={index}
                >
                  <span
                    className={`font-mono text-sm font-bold ${winner ? 'text-primary' : 'text-ink'}`}
                  >
                    {index}
                  </span>
                  <div
                    className="h-2 overflow-hidden bg-muted"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full transition-[width] duration-500 ${winner ? 'bg-primary' : 'bg-muted-foreground/45'}`}
                      style={{ width: `${shown * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-right font-mono text-xs ${winner ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                  >
                    {(shown * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section
        className="border border-border bg-card/60 p-5 sm:p-6"
        aria-labelledby="cnn-layers-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
              02 · Feature extraction
            </p>
            <h2
              id="cnn-layers-heading"
              className="mt-2 text-xl font-bold text-ink"
            >
              Dữ liệu qua từng layer
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            mô phỏng LeNet thu gọn
          </span>
        </div>

        <ol
          className="mt-5 grid grid-cols-7 gap-1"
          aria-label="Tiến trình xử lý CNN"
        >
          {stages.map((item, index) => (
            <li key={item.name}>
              <div
                className={`h-1.5 transition-colors ${index <= stage ? 'bg-primary' : 'bg-muted'}`}
              />
              <span
                className={`mt-2 hidden text-xs font-semibold lg:block ${index === stage ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ol>

        {stage < 0 ? (
          <div className="mt-6 grid min-h-56 place-items-center border border-dashed border-border bg-background/45 px-6 text-center">
            <div>
              <p className="font-semibold text-ink">Chưa có dữ liệu layer</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Chọn một chữ số và nhấn “Xử lý ảnh”. Kết quả sẽ xuất hiện lần
                lượt khi CNN xử lý đến từng bước.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <LayerCard
              stageIndex={0}
              currentStage={stage}
              title="Input"
              shape="16 × 16 × 1"
              note={stages[0].note}
            >
              <PixelMap matrix={pipeline.input} label="Ảnh pixel đầu vào" />
            </LayerCard>
            <LayerCard
              stageIndex={1}
              currentStage={stage}
              title="Conv 1 + ReLU"
              shape="14 × 14 × 1"
              note={stages[1].note}
            >
              <PixelMap
                matrix={pipeline.conv1}
                label="Feature map sau convolution thứ nhất"
              />
            </LayerCard>
            <LayerCard
              stageIndex={2}
              currentStage={stage}
              title="MaxPool 1"
              shape="7 × 7 × 1"
              note={stages[2].note}
            >
              <PixelMap
                matrix={pipeline.pool1}
                label="Feature map sau max pooling thứ nhất"
              />
            </LayerCard>
            <LayerCard
              stageIndex={3}
              currentStage={stage}
              title="Conv 2 + ReLU"
              shape="5 × 5 × 1"
              note={stages[3].note}
            >
              <PixelMap
                matrix={pipeline.conv2}
                label="Feature map sau convolution thứ hai"
              />
            </LayerCard>
            <LayerCard
              stageIndex={4}
              currentStage={stage}
              title="MaxPool 2"
              shape="2 × 2 × 1"
              note={stages[4].note}
            >
              <PixelMap
                matrix={pipeline.pool2}
                label="Feature map sau max pooling thứ hai"
                largeCells
              />
            </LayerCard>
            <LayerCard
              stageIndex={5}
              currentStage={stage}
              title="Flatten"
              shape="4 values"
              note={stages[5].note}
            >
              <div
                className="grid w-full max-w-[210px] grid-cols-4 gap-2"
                aria-label="Vector gồm bốn giá trị"
              >
                {pipeline.flattened.map((value, index) => (
                  <span
                    className="grid aspect-square place-items-center border border-primary/20 bg-primary-soft font-mono text-xs font-bold text-primary"
                    key={index}
                  >
                    {value.toFixed(2)}
                  </span>
                ))}
              </div>
            </LayerCard>
            <LayerCard
              stageIndex={6}
              currentStage={stage}
              title="Dense + Softmax"
              shape="10 classes"
              note={stages[6].note}
              wide
            >
              <div
                className="flex w-full max-w-[310px] items-end gap-1.5"
                aria-label="Mười activation đầu ra"
              >
                {pipeline.probabilities.map((value, index) => (
                  <div
                    className="flex flex-1 flex-col items-center gap-1"
                    key={index}
                  >
                    <span
                      className={`w-full ${index === digit ? 'bg-primary' : 'bg-muted-foreground/35'}`}
                      style={{ height: `${18 + value * 95}px` }}
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {index}
                    </span>
                  </div>
                ))}
              </div>
            </LayerCard>
          </div>
        )}

        {stage >= 0 ? (
          <div
            className="mt-5 border-l-2 border-primary bg-primary-soft/45 px-4 py-3"
            aria-live="polite"
          >
            <p className="font-mono text-xs font-bold text-primary">
              {stage < 0
                ? 'Chưa bắt đầu'
                : `${stages[visibleStage].name} · ${stages[visibleStage].shape}`}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {stage < 0
                ? 'Chọn một mẫu rồi nhấn “Xử lý ảnh” để mở lần lượt từng layer.'
                : stages[visibleStage].note}
            </p>
          </div>
        ) : null}
      </section>

      <section
        className="grid gap-px border border-border bg-border md:grid-cols-3"
        aria-label="Ba cơ chế chính của CNN"
      >
        {[
          [
            'Convolution',
            'Kernel dùng chung quét qua ảnh để tìm mẫu cục bộ như cạnh và góc.',
          ],
          [
            'Pooling',
            'Giảm kích thước feature map nhưng giữ lại tín hiệu nổi bật trong mỗi vùng.',
          ],
          [
            'Classification',
            'Vector đặc trưng được biến thành score rồi thành xác suất bằng softmax.',
          ],
        ].map(([title, description]) => (
          <div className="bg-background p-5" key={title}>
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </section>
    </section>
  );
}

function PixelMap({
  matrix,
  label,
  compact = false,
  invert = false,
  largeCells = false,
}: {
  matrix: Matrix;
  label: string;
  compact?: boolean;
  invert?: boolean;
  largeCells?: boolean;
}) {
  const size = matrix.length;
  return (
    <div
      className={`${compact ? 'w-full max-w-14' : largeCells ? 'w-full max-w-32' : 'w-full max-w-[190px]'} grid aspect-square overflow-hidden border ${invert ? 'border-primary-foreground/25 bg-primary' : 'border-border bg-background'}`}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      aria-label={label}
    >
      {matrix.flat().map((value, index) => (
        <span
          key={index}
          className="aspect-square"
          style={{
            backgroundColor: invert
              ? `color-mix(in srgb, var(--primary-foreground) ${Math.round(value * 100)}%, var(--primary))`
              : `color-mix(in srgb, var(--primary) ${Math.round(value * 92)}%, var(--background))`,
          }}
        />
      ))}
    </div>
  );
}

function LayerCard({
  stageIndex,
  currentStage,
  title,
  shape,
  note,
  children,
  wide = false,
}: {
  stageIndex: number;
  currentStage: number;
  title: string;
  shape: string;
  note: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (currentStage < stageIndex) return null;

  return (
    <article
      className={`flex min-h-[310px] flex-col border border-primary/35 bg-background p-4 transition-all duration-500 ${wide ? 'md:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink">{title}</h3>
        <span className="font-mono text-xs text-primary">{shape}</span>
      </div>
      <div className="grid flex-1 place-items-center py-5">{children}</div>
      <p className="text-sm leading-6 text-muted-foreground">{note}</p>
    </article>
  );
}
