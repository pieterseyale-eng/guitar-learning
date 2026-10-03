import type { FC, KeyboardEvent } from 'react'

const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'] as const
const STRINGS = 6
export const MAX_FRET = 24

export type FretboardDotState =
  | 'default'
  | 'highlight'
  | 'selected'
  | 'correct'
  | 'wrong'
  | 'missed'

export interface FretboardDot {
  stringIndex: number
  fret: number
  highlight?: boolean
  state?: FretboardDotState
  label?: string
}

export interface FretboardPosition {
  stringIndex: number
  fret: number
}

export interface FretboardSvgProps {
  width?: number
  height?: number
  dots?: FretboardDot[]
  root?: FretboardPosition
  interactive?: boolean
  disabled?: boolean
  enabledStringIndices?: readonly number[]
  onPositionClick?: (position: FretboardPosition) => void
}

const DEFAULT_WIDTH = 1820
const DEFAULT_HEIGHT = 390
const BOARD_LEFT = 96
const BOARD_TOP = 42
const OPEN_WIDTH = 52
const STRING_SPACING = 50
const BOARD_HEIGHT = (STRINGS - 1) * STRING_SPACING
const BOARD_WIDTH = 1680
/** Fender 常见 Stratocaster / Telecaster 弦长：25.5 英寸（648 mm）。 */
const SCALE_LENGTH_MM = 648
const FRETBOARD_END_MM =
  SCALE_LENGTH_MM * (1 - 2 ** (-MAX_FRET / 12))

const STRING_STROKE_WIDTHS = [1.1, 1.45, 1.85, 2.25, 2.7, 3.15]
const SINGLE_MARKER_FRETS = [3, 5, 7, 9, 15, 17, 19, 21] as const
const DOUBLE_MARKER_FRETS = [12, 24] as const

const DOT_COLORS: Record<
  FretboardDotState,
  { fill: string; stroke: string; text: string; radius: number }
> = {
  default: {
    fill: 'rgba(217, 195, 153, 0.55)',
    stroke: 'rgba(245, 220, 170, 0.85)',
    text: '#fffaf0',
    radius: 11,
  },
  highlight: {
    fill: '#f3c969',
    stroke: '#fff0b5',
    text: '#2b2115',
    radius: 14,
  },
  selected: {
    fill: '#4b9ed8',
    stroke: '#b9e4ff',
    text: '#ffffff',
    radius: 14,
  },
  correct: {
    fill: '#41b883',
    stroke: '#baf4d8',
    text: '#ffffff',
    radius: 15,
  },
  wrong: {
    fill: '#df5e62',
    stroke: '#ffd0d2',
    text: '#ffffff',
    radius: 15,
  },
  missed: {
    fill: '#e4aa3a',
    stroke: '#ffe3a7',
    text: '#2b2115',
    radius: 15,
  },
}

function getDotPosition(stringIndex: number, fret: number) {
  return {
    cx: fret === 0 ? BOARD_LEFT - OPEN_WIDTH / 2 : getFretCenterX(fret),
    cy: BOARD_TOP + stringIndex * STRING_SPACING,
  }
}

/** 十二平均律：第 n 品离琴枕的距离 d = L × (1 - 2^(-n/12))。 */
function getFretDistanceMm(fret: number): number {
  return SCALE_LENGTH_MM * (1 - 2 ** (-fret / 12))
}

function getFretX(fret: number): number {
  return BOARD_LEFT + (getFretDistanceMm(fret) / FRETBOARD_END_MM) * BOARD_WIDTH
}

function getFretCenterX(fret: number): number {
  return (getFretX(fret - 1) + getFretX(fret)) / 2
}

const FretboardSvg: FC<FretboardSvgProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  dots = [],
  root,
  interactive = false,
  disabled = false,
  enabledStringIndices,
  onPositionClick,
}) => {
  const enabledStrings = new Set(
    enabledStringIndices ?? Array.from({ length: STRINGS }, (_, index) => index)
  )

  const activatePosition = (position: FretboardPosition) => {
    if (!disabled && enabledStrings.has(position.stringIndex)) {
      onPositionClick?.(position)
    }
  }

  const handlePositionKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    position: FretboardPosition
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activatePosition(position)
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`fretboard-svg ${interactive ? 'is-interactive' : ''}`}
      aria-label={`吉他指板，开放弦到第 ${MAX_FRET} 品`}
      role="img"
    >
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1812" />
          <stop offset="46%" stopColor="#4b2b1e" />
          <stop offset="100%" stopColor="#261611" />
        </linearGradient>
        <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

      <text
        x={BOARD_LEFT - OPEN_WIDTH / 2}
        y={18}
        textAnchor="middle"
        fill="#a9a39a"
        fontSize={13}
        fontFamily="system-ui, sans-serif"
      >
        空弦
      </text>

      <rect
        x={BOARD_LEFT}
        y={BOARD_TOP}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        rx={3}
        fill="url(#wood)"
        stroke="#6b4938"
        strokeWidth={1.5}
      />

      {Array.from({ length: MAX_FRET }, (_, i) => (
        <line
          key={`fret-${i + 1}`}
          x1={getFretX(i + 1)}
          y1={BOARD_TOP}
          x2={getFretX(i + 1)}
          y2={BOARD_TOP + BOARD_HEIGHT}
          stroke="#9a8e80"
          strokeOpacity={0.58}
          strokeWidth={i === MAX_FRET - 1 ? 2 : 1}
        />
      ))}

      <line
        x1={BOARD_LEFT}
        y1={BOARD_TOP - 1}
        x2={BOARD_LEFT}
        y2={BOARD_TOP + BOARD_HEIGHT + 1}
        stroke="#e0d4bd"
        strokeWidth={5}
      />

      {SINGLE_MARKER_FRETS.map((fret) => (
        <circle
          key={`inlay-${fret}`}
          cx={getFretCenterX(fret)}
          cy={BOARD_TOP + 2.5 * STRING_SPACING}
          r={8}
          fill="#d5cdc0"
          opacity={0.72}
        />
      ))}

      {DOUBLE_MARKER_FRETS.flatMap((fret) =>
        [1.5, 3.5].map((stringOffset) => (
          <circle
            key={`inlay-${fret}-${stringOffset}`}
            cx={getFretCenterX(fret)}
            cy={BOARD_TOP + stringOffset * STRING_SPACING}
            r={8}
            fill="#d5cdc0"
            opacity={0.72}
          />
        ))
      )}

      {Array.from({ length: STRINGS }, (_, i) => (
        <line
          key={`string-${i}`}
          x1={BOARD_LEFT - OPEN_WIDTH}
          y1={BOARD_TOP + i * STRING_SPACING}
          x2={BOARD_LEFT + BOARD_WIDTH}
          y2={BOARD_TOP + i * STRING_SPACING}
          stroke="#b8b5ae"
          strokeWidth={STRING_STROKE_WIDTHS[i]}
        />
      ))}

      {STRING_NAMES.map((name, i) => (
        <text
          key={`name-${i}`}
          x={18}
          y={BOARD_TOP + i * STRING_SPACING}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#e7e2da"
          fontSize={16}
          fontWeight={700}
          fontFamily="system-ui, sans-serif"
        >
          {name}
        </text>
      ))}

      <text
        x={BOARD_LEFT - OPEN_WIDTH / 2}
        y={BOARD_TOP + BOARD_HEIGHT + 42}
        textAnchor="middle"
        fill="#aaa49b"
        fontSize={13}
        fontFamily="system-ui, sans-serif"
      >
        0
      </text>

      {Array.from({ length: MAX_FRET }, (_, i) => (
        <text
          key={`number-${i + 1}`}
          x={getFretCenterX(i + 1)}
          y={BOARD_TOP + BOARD_HEIGHT + 42}
          textAnchor="middle"
          fill="#aaa49b"
          fontSize={13}
          fontFamily="system-ui, sans-serif"
        >
          {i + 1}
        </text>
      ))}

      {root != null && (() => {
        const { cx, cy } = getDotPosition(root.stringIndex, root.fret)
        return (
          <circle
            cx={cx}
            cy={cy}
            r={17}
            fill="none"
            stroke="#4fc3f7"
            strokeWidth={2.5}
          />
        )
      })()}

      {dots.map((dot, index) => {
        const { cx, cy } = getDotPosition(dot.stringIndex, dot.fret)
        const state = dot.state ?? (dot.highlight ? 'highlight' : 'default')
        const colors = DOT_COLORS[state]
        return (
          <g
            key={`dot-${index}-${dot.stringIndex}-${dot.fret}`}
            filter="url(#dotShadow)"
            pointerEvents="none"
          >
            <circle
              cx={cx}
              cy={cy}
              r={colors.radius}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
            />
            {dot.label != null && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize={dot.label.length > 1 ? 10 : 12}
                fontWeight={800}
                fontFamily="system-ui, sans-serif"
              >
                {dot.label}
              </text>
            )}
          </g>
        )
      })}

      {interactive &&
        Array.from({ length: STRINGS }, (_, stringIndex) =>
          enabledStrings.has(stringIndex)
            ? Array.from({ length: MAX_FRET + 1 }, (_, fret) => {
            const position = { stringIndex, fret }
            const x =
              fret === 0
                ? BOARD_LEFT - OPEN_WIDTH
                : getFretX(fret - 1)
            const fretCellWidth =
              fret === 0 ? OPEN_WIDTH : getFretX(fret) - getFretX(fret - 1)
            return (
              <g
                key={`target-${stringIndex}-${fret}`}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={`${stringIndex + 1}弦（${STRING_NAMES[stringIndex]}），${
                  fret === 0 ? '空弦' : `第 ${fret} 品`
                }`}
                aria-disabled={disabled}
                className="fret-position-target"
                onClick={() => activatePosition(position)}
                onKeyDown={(event) => handlePositionKeyDown(event, position)}
              >
                <rect
                  x={x}
                  y={BOARD_TOP + stringIndex * STRING_SPACING - STRING_SPACING / 2}
                  width={fretCellWidth}
                  height={STRING_SPACING}
                  fill="transparent"
                />
              </g>
            )
              })
            : null
        )}
    </svg>
  )
}

export default FretboardSvg
