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
const DEFAULT_HEIGHT = 440
const BOARD_LEFT = 96
const BOARD_TOP = 42
const OPEN_WIDTH = 52
const STRING_SPACING = 50
const STRING_EDGE_INSET = 26
const BOARD_HEIGHT =
  (STRINGS - 1) * STRING_SPACING + STRING_EDGE_INSET * 2
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
    cy: getStringY(stringIndex),
  }
}

function getStringY(stringIndex: number): number {
  return BOARD_TOP + STRING_EDGE_INSET + stringIndex * STRING_SPACING
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
        <linearGradient id="fretMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#555b5e" />
          <stop offset="18%" stopColor="#b9c0c1" />
          <stop offset="38%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#d9dede" />
          <stop offset="82%" stopColor="#858c8f" />
          <stop offset="100%" stopColor="#42474a" />
        </linearGradient>
        <linearGradient id="nutMaterial" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#958c7a" />
          <stop offset="18%" stopColor="#f1eadb" />
          <stop offset="48%" stopColor="#fffaf0" />
          <stop offset="78%" stopColor="#d9cfbc" />
          <stop offset="100%" stopColor="#827968" />
        </linearGradient>
        <linearGradient
          id="stringMetal"
          gradientUnits="userSpaceOnUse"
          x1={BOARD_LEFT - OPEN_WIDTH}
          y1="0"
          x2={BOARD_LEFT + BOARD_WIDTH}
          y2="0"
        >
          <stop offset="0%" stopColor="#aeb4b3" />
          <stop offset="16%" stopColor="#f2f4f1" />
          <stop offset="43%" stopColor="#a6adac" />
          <stop offset="70%" stopColor="#e8ebea" />
          <stop offset="100%" stopColor="#a0a6a5" />
        </linearGradient>
        <filter id="fretShadow" x="-100%" y="-5%" width="300%" height="110%">
          <feDropShadow dx="1.2" dy="0.8" stdDeviation="1" floodColor="#050302" floodOpacity="0.75" />
        </filter>
        <filter id="nutShadow" x="-100%" y="-5%" width="300%" height="110%">
          <feDropShadow dx="2" dy="1" stdDeviation="1.6" floodColor="#050302" floodOpacity="0.8" />
        </filter>
        <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

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

      {Array.from({ length: MAX_FRET }, (_, i) => {
        const x = getFretX(i + 1)
        const fretWidth = i === MAX_FRET - 1 ? 6.4 : 5.2
        return (
          <g key={`fret-${i + 1}`} filter="url(#fretShadow)">
            <rect
              x={x - fretWidth / 2}
              y={BOARD_TOP + 2}
              width={fretWidth}
              height={BOARD_HEIGHT - 4}
              rx={fretWidth / 2}
              fill="url(#fretMetal)"
            />
            <line
              x1={x - fretWidth * 0.16}
              y1={BOARD_TOP + 4}
              x2={x - fretWidth * 0.16}
              y2={BOARD_TOP + BOARD_HEIGHT - 4}
              stroke="#ffffff"
              strokeOpacity={0.72}
              strokeWidth={0.9}
            />
          </g>
        )
      })}

      <g aria-label="0品琴枕" filter="url(#nutShadow)">
        <title>0品 · 琴枕</title>
        <rect
          x={BOARD_LEFT - 4.5}
          y={BOARD_TOP - 3}
          width={9}
          height={BOARD_HEIGHT + 6}
          rx={3.5}
          fill="url(#nutMaterial)"
        />
        <line
          x1={BOARD_LEFT - 1.4}
          y1={BOARD_TOP}
          x2={BOARD_LEFT - 1.4}
          y2={BOARD_TOP + BOARD_HEIGHT}
          stroke="#ffffff"
          strokeOpacity={0.72}
          strokeWidth={1.1}
        />
      </g>

      {SINGLE_MARKER_FRETS.map((fret) => (
        <circle
          key={`inlay-${fret}`}
          cx={getFretCenterX(fret)}
          cy={BOARD_TOP + STRING_EDGE_INSET + 2.5 * STRING_SPACING}
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
            cy={BOARD_TOP + STRING_EDGE_INSET + stringOffset * STRING_SPACING}
            r={8}
            fill="#d5cdc0"
            opacity={0.72}
          />
        ))
      )}

      {Array.from({ length: STRINGS }, (_, i) => (
        <g key={`string-${i}`}>
          <line
            x1={BOARD_LEFT - OPEN_WIDTH}
            y1={getStringY(i) + 1.2}
            x2={BOARD_LEFT + BOARD_WIDTH}
            y2={getStringY(i) + 1.2}
            stroke="#080605"
            strokeOpacity={0.44}
            strokeWidth={STRING_STROKE_WIDTHS[i] + 0.9}
          />
          <line
            x1={BOARD_LEFT - OPEN_WIDTH}
            y1={getStringY(i)}
            x2={BOARD_LEFT + BOARD_WIDTH}
            y2={getStringY(i)}
            stroke="url(#stringMetal)"
            strokeWidth={STRING_STROKE_WIDTHS[i]}
            strokeLinecap="round"
          />
          <line
            x1={BOARD_LEFT - OPEN_WIDTH}
            y1={getStringY(i) - 0.45}
            x2={BOARD_LEFT + BOARD_WIDTH}
            y2={getStringY(i) - 0.45}
            stroke="#f7f8f4"
            strokeOpacity={0.72}
            strokeWidth={Math.max(0.55, STRING_STROKE_WIDTHS[i] * 0.28)}
            strokeLinecap="round"
          />
        </g>
      ))}

      {STRING_NAMES.map((name, i) => (
        <text
          key={`name-${i}`}
          x={18}
          y={getStringY(i)}
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
        x={BOARD_LEFT}
        y={BOARD_TOP + BOARD_HEIGHT + 42}
        textAnchor="middle"
        fill="#d8cdb9"
        fontSize={13}
        fontWeight={700}
        fontFamily="system-ui, sans-serif"
      >
        0
      </text>

      {Array.from({ length: MAX_FRET }, (_, i) => (
        <text
          key={`number-${i + 1}`}
          x={getFretX(i + 1)}
          y={BOARD_TOP + BOARD_HEIGHT + 42}
          textAnchor="middle"
          fill="#aaa49b"
          fontSize={i >= 19 ? 11 : 12}
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
                  y={getStringY(stringIndex) - STRING_SPACING / 2}
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
