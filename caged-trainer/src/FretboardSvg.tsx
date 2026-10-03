import type { FC } from 'react'

const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'] as const
const STRINGS = 6
const FRETS = 16

export interface FretboardDot {
  stringIndex: number
  fret: number
  highlight?: boolean
  /** Debug 时显示在点旁的文本，如度数或 (s,f) */
  label?: string
}

export interface FretboardSvgProps {
  width?: number
  height?: number
  dots?: FretboardDot[]
  /** Debug 时绘制的 root 点位置 */
  root?: { stringIndex: number; fret: number }
}

const DEFAULT_WIDTH = 720
const DEFAULT_HEIGHT = 280
const LABEL_LEFT = 28
const LABEL_BOTTOM = 24
const FRET_WIDTH = 40
const STRING_SPACING = 36

/** 弦线粗细：从上（高音 E）到下（低音 E）依次变粗 */
const STRING_STROKE_WIDTHS = [1, 1.35, 1.7, 2.05, 2.4, 2.8]

/** Fender 风格品记：3、5、7、9、15 单点，12 品双点 */
const FRET_MARKERS: { fret: number; offset: number }[] = [
  { fret: 3, offset: 0 },
  { fret: 5, offset: 0 },
  { fret: 7, offset: 0 },
  { fret: 9, offset: 0 },
  { fret: 12, offset: -6 },
  { fret: 12, offset: 6 },
  { fret: 15, offset: 0 },
]
const FRET_MARKER_Y = 8
const FRET_MARKER_R = 4

/** 指板正面品记：白色圆点。3、5、7、9、15 品各一个（G/D 弦之间），12 品两个（B/G 之间、D/A 之间）。半径略大但不压弦、不压品丝 */
const INLAY_SINGLE_FRETS = [3, 5, 7, 9, 15] as const
const INLAY_R = 10

const FretboardSvg: FC<FretboardSvgProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  dots = [],
  root,
}) => {
  const boardLeft = LABEL_LEFT
  const boardTop = 20
  const boardWidth = FRETS * FRET_WIDTH
  const boardHeight = (STRINGS - 1) * STRING_SPACING

  const getDotPosition = (stringIndex: number, fret: number) => ({
    cx: boardLeft + (fret - 0.5) * FRET_WIDTH,
    cy: boardTop + stringIndex * STRING_SPACING,
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="fretboard-svg"
    >
      {/* 指板背景 */}
      <rect
        x={boardLeft}
        y={boardTop}
        width={boardWidth}
        height={boardHeight}
        fill="#2d1810"
        stroke="#5c4033"
        strokeWidth={1}
      />
      {/* 琴枕（0品）竖线 */}
      <line
        x1={boardLeft}
        y1={boardTop}
        x2={boardLeft}
        y2={boardTop + boardHeight}
        stroke="#8b7355"
        strokeWidth={3}
      />
      {/* 品丝竖线 1..16 */}
      {Array.from({ length: FRETS }, (_, i) => (
        <line
          key={i}
          x1={boardLeft + (i + 1) * FRET_WIDTH}
          y1={boardTop}
          x2={boardLeft + (i + 1) * FRET_WIDTH}
          y2={boardTop + boardHeight}
          stroke="#5c4033"
          strokeWidth={1}
        />
      ))}
      {/* 弦线 0..5：最下边最粗，依次往上变细，灰色便于在浅色背景下看清 */}
      {Array.from({ length: STRINGS }, (_, i) => (
        <line
          key={i}
          x1={boardLeft}
          y1={boardTop + i * STRING_SPACING}
          x2={boardLeft + boardWidth}
          y2={boardTop + i * STRING_SPACING}
          stroke="#6b6b6b"
          strokeWidth={STRING_STROKE_WIDTHS[i]}
        />
      ))}
      {/* 指板正面品记：白色圆点。3、5、7、9、15 单点（G/D 间），12 品双点（B/G 间、D/A 间） */}
      {INLAY_SINGLE_FRETS.map((fret) => (
        <circle
          key={`inlay-${fret}`}
          cx={boardLeft + (fret - 0.5) * FRET_WIDTH}
          cy={boardTop + 2.5 * STRING_SPACING}
          r={INLAY_R}
          fill="#d4d0c8"
        />
      ))}
      <circle
        cx={boardLeft + (12 - 0.5) * FRET_WIDTH}
        cy={boardTop + 1.5 * STRING_SPACING}
        r={INLAY_R}
        fill="#d4d0c8"
      />
      <circle
        cx={boardLeft + (12 - 0.5) * FRET_WIDTH}
        cy={boardTop + 3.5 * STRING_SPACING}
        r={INLAY_R}
        fill="#d4d0c8"
      />
      {/* 左侧弦名 E B G D A E */}
      {STRING_NAMES.map((name, i) => (
        <text
          key={i}
          x={boardLeft - 10}
          y={boardTop + i * STRING_SPACING + 5}
          textAnchor="end"
          dominantBaseline="middle"
          fill="#eee"
          fontSize={14}
          fontFamily="system-ui, sans-serif"
        >
          {name}
        </text>
      ))}
      {/* 品记（Fender 风格）：3、5、7、9、15 单点，12 品双点 */}
      {FRET_MARKERS.map(({ fret, offset }, i) => (
        <circle
          key={`marker-${fret}-${i}`}
          cx={boardLeft + (fret - 0.5) * FRET_WIDTH + offset}
          cy={boardTop + boardHeight + FRET_MARKER_Y}
          r={FRET_MARKER_R}
          fill="rgba(255,255,255,0.35)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.8}
        />
      ))}
      {/* 底部品位 1..16 */}
      {Array.from({ length: FRETS }, (_, i) => (
        <text
          key={i}
          x={boardLeft + (i + 0.5) * FRET_WIDTH}
          y={boardTop + boardHeight + LABEL_BOTTOM - 6}
          textAnchor="middle"
          fill="#aaa"
          fontSize={12}
          fontFamily="system-ui, sans-serif"
        >
          {i + 1}
        </text>
      ))}
      {/* Debug: root 点 */}
      {root != null && (() => {
        const { cx, cy } = getDotPosition(root.stringIndex, root.fret)
        return (
          <g key="root">
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill="none"
              stroke="#0af"
              strokeWidth={2.5}
            />
            <text
              x={cx}
              y={cy - 16}
              textAnchor="middle"
              fill="#0af"
              fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              R ({root.stringIndex},{root.fret})
            </text>
          </g>
        )
      })()}
      {/* 圆点：先画淡色，再画高亮（高亮在上层） */}
      {dots
        .filter((d) => !d.highlight)
        .map((d, i) => {
          const { cx, cy } = getDotPosition(d.stringIndex, d.fret)
          return (
            <g key={`fade-${i}-${d.stringIndex}-${d.fret}`}>
              <circle
                cx={cx}
                cy={cy}
                r={10}
                fill="rgba(200, 180, 140, 0.5)"
                stroke="rgba(180, 160, 120, 0.8)"
                strokeWidth={1}
              />
              {d.label != null && (
                <text
                  x={cx + 14}
                  y={cy + 4}
                  textAnchor="start"
                  fill="rgba(255,255,255,0.9)"
                  fontSize={10}
                  fontFamily="system-ui, sans-serif"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      {dots
        .filter((d) => d.highlight)
        .map((d, i) => {
          const { cx, cy } = getDotPosition(d.stringIndex, d.fret)
          return (
            <g key={`hl-${i}-${d.stringIndex}-${d.fret}`}>
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill="#f4d03f"
                stroke="#d4a017"
                strokeWidth={2}
              />
              {d.label != null && (
                <text
                  x={cx + 14}
                  y={cy + 4}
                  textAnchor="start"
                  fill="#f4d03f"
                  fontSize={10}
                  fontFamily="system-ui, sans-serif"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
    </svg>
  )
}

export default FretboardSvg
