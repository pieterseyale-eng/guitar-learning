import {
  MAJOR_KEYS,
  MAJOR_SCALES,
  OPEN_STRING_PITCH_CLASSES,
  noteToPitchClass,
  pitchClassAt,
} from './fretboardQuiz'
import type { MajorKey } from './fretboardQuiz'
import type { FretPosition } from './fretboardQuiz'

export type TriadInversion = 0 | 1 | 2
export type TriadQuality = 'major' | 'minor'
export type StringGroupLabel = '123弦' | '234弦' | '345弦' | '456弦'
export type TriadShapeOffsets = readonly [number, number, number]

export interface StringGroup {
  label: StringGroupLabel
  stringIndices: readonly [number, number, number]
}

export const STRING_GROUPS: readonly StringGroup[] = [
  { label: '123弦', stringIndices: [0, 1, 2] },
  { label: '234弦', stringIndices: [1, 2, 3] },
  { label: '345弦', stringIndices: [2, 3, 4] },
  { label: '456弦', stringIndices: [3, 4, 5] },
]

/**
 * 固定三和弦指型模板。数组按低音弦到高音弦排列，数值是相对品位；
 * 每个模板只允许三个品位一起整体平移。
 */
export const TRIAD_SHAPE_TEMPLATES: Record<
  StringGroupLabel,
  Record<TriadQuality, Record<TriadInversion, TriadShapeOffsets>>
> = {
  '123弦': {
    major: { 0: [2, 2, 0], 1: [1, 0, 0], 2: [0, 1, 0] },
    minor: { 0: [2, 1, 0], 1: [0, 0, 0], 2: [1, 2, 0] },
  },
  '234弦': {
    major: { 0: [2, 1, 0], 1: [2, 0, 1], 2: [0, 0, 0] },
    minor: { 0: [2, 0, 0], 1: [1, 0, 1], 2: [1, 1, 0] },
  },
  '345弦': {
    major: { 0: [3, 2, 0], 1: [2, 0, 0], 2: [1, 1, 0] },
    minor: { 0: [3, 1, 0], 1: [1, 0, 0], 2: [2, 2, 0] },
  },
  '456弦': {
    major: { 0: [3, 2, 0], 1: [2, 0, 0], 2: [1, 1, 0] },
    minor: { 0: [3, 1, 0], 1: [1, 0, 0], 2: [2, 2, 0] },
  },
}

const FUNCTIONAL_CHORDS: readonly {
  degree: number
  quality: TriadQuality
}[] = [
  { degree: 1, quality: 'major' },
  { degree: 2, quality: 'minor' },
  { degree: 3, quality: 'minor' },
  { degree: 4, quality: 'major' },
  { degree: 5, quality: 'major' },
  { degree: 6, quality: 'minor' },
]

export const INVERSION_NAMES = ['原位', '第一转位', '第二转位'] as const

export interface FunctionalChordToneTarget {
  stringIndex: number
  note: string
  pitchClass: number
}

export interface FunctionalChordQuestion {
  key: MajorKey
  chordDegree: number
  quality: TriadQuality
  inversion: TriadInversion
  inversionName: (typeof INVERSION_NAMES)[number]
  functionSymbol: string
  chordName: string
  rootPositionNotes: readonly string[]
  orderedNotes: readonly string[]
  orderedIntervals: readonly string[]
  stringGroup: StringGroup
  targets: readonly FunctionalChordToneTarget[]
  id: string
}

export interface LegalVoicing {
  /** 按低音弦到高音弦排列。 */
  positions: readonly FretPosition[]
}

const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40] as const
const SHARP_PITCH_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const
const FLAT_PITCH_NAMES = [
  'C', 'Db', 'D', 'Eb', 'E', 'F',
  'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
] as const

function wrapScaleDegree(degree: number): number {
  return ((degree - 1) % 7) + 1
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function buildFunctionalChordQuestion(
  key: MajorKey,
  chordDegree: number,
  inversion: TriadInversion,
  stringGroup: StringGroup
): FunctionalChordQuestion {
  const chord = FUNCTIONAL_CHORDS.find((item) => item.degree === chordDegree)
  if (chord == null) throw new Error(`不支持的功能和弦：${chordDegree}`)

  const scale = MAJOR_SCALES[key]
  const toneDegrees = [
    wrapScaleDegree(chordDegree),
    wrapScaleDegree(chordDegree + 2),
    wrapScaleDegree(chordDegree + 4),
  ]
  const rootPositionNotes = toneDegrees.map((degree) => scale[degree - 1])
  const rootPositionIntervals =
    chord.quality === 'major' ? ['1', '3', '5'] : ['1', 'b3', '5']
  const orderedNotes = [
    ...rootPositionNotes.slice(inversion),
    ...rootPositionNotes.slice(0, inversion),
  ]
  const orderedIntervals = [
    ...rootPositionIntervals.slice(inversion),
    ...rootPositionIntervals.slice(0, inversion),
  ]
  const bassScaleDegree = toneDegrees[inversion]
  const qualitySuffix = chord.quality === 'minor' ? 'm' : ''
  const functionSymbol = `${chordDegree}${qualitySuffix}${
    inversion === 0 ? '' : `/${bassScaleDegree}`
  }`
  const chordName = `${rootPositionNotes[0]}${qualitySuffix}`

  // 音序按低到高排列；吉他弦编号越大，音高越低。
  const stringsLowToHigh = [...stringGroup.stringIndices].sort((a, b) => b - a)
  const targets = stringsLowToHigh.map((stringIndex, index) => ({
    stringIndex,
    note: orderedNotes[index],
    pitchClass: noteToPitchClass(orderedNotes[index]),
  }))

  return {
    key,
    chordDegree,
    quality: chord.quality,
    inversion,
    inversionName: INVERSION_NAMES[inversion],
    functionSymbol,
    chordName,
    rootPositionNotes,
    orderedNotes,
    orderedIntervals,
    stringGroup,
    targets,
    id: `${key}-${functionSymbol}-${stringGroup.label}`,
  }
}

export function makeFunctionalChordQuestion(
  keys: readonly MajorKey[] = MAJOR_KEYS,
  stringGroups: readonly StringGroup[] = STRING_GROUPS,
  previousId?: string
): FunctionalChordQuestion {
  const availableKeys = keys.length > 0 ? keys : MAJOR_KEYS
  const availableStringGroups =
    stringGroups.length > 0 ? stringGroups : STRING_GROUPS
  let question: FunctionalChordQuestion
  do {
    const key = pick(availableKeys)
    const chord = pick(FUNCTIONAL_CHORDS)
    const inversion = pick([0, 1, 2] as const)
    const stringGroup = pick(availableStringGroups)
    question = buildFunctionalChordQuestion(
      key,
      chord.degree,
      inversion,
      stringGroup
    )
  } while (question.id === previousId)
  return question
}

export function getCorrectFretsForTarget(
  target: FunctionalChordToneTarget,
  maxFret = 24
): number[] {
  const frets: number[] = []
  for (let fret = 0; fret <= maxFret; fret += 1) {
    if (pitchClassAt(target.stringIndex, fret) === target.pitchClass) {
      frets.push(fret)
    }
  }
  return frets
}

export function absolutePitchAt(position: FretPosition): number {
  return OPEN_STRING_MIDI[position.stringIndex] + position.fret
}

export function getLegalVoicings(
  question: FunctionalChordQuestion,
  maxFret = 24
): LegalVoicing[] {
  const template =
    TRIAD_SHAPE_TEMPLATES[question.stringGroup.label][question.quality][
      question.inversion
    ]
  const lowTarget = question.targets[0]
  const baseShift =
    (lowTarget.pitchClass -
      OPEN_STRING_PITCH_CLASSES[lowTarget.stringIndex] -
      template[0] +
      24) %
    12
  const voicings: LegalVoicing[] = []

  for (let shift = baseShift; shift <= maxFret; shift += 12) {
    const positions = question.targets.map((target, index) => ({
      stringIndex: target.stringIndex,
      fret: shift + template[index],
    }))
    if (positions.some((position) => position.fret > maxFret)) continue

    const matchesTargets = positions.every(
      (position, index) =>
        pitchClassAt(position.stringIndex, position.fret) ===
        question.targets[index].pitchClass
    )
    const pitches = positions.map(absolutePitchAt)
    if (
      matchesTargets &&
      pitches[0] < pitches[1] &&
      pitches[1] < pitches[2]
    ) {
      voicings.push({ positions })
    }
  }

  return voicings
}

export function isLegalVoicing(
  question: FunctionalChordQuestion,
  selectedPositions: readonly FretPosition[],
  maxFret = 24
): boolean {
  if (selectedPositions.length !== 3) return false
  const selectedIds = new Set(
    selectedPositions.map((position) => `${position.stringIndex}-${position.fret}`)
  )
  return getLegalVoicings(question, maxFret).some(
    (voicing) =>
      voicing.positions.every((position) =>
        selectedIds.has(`${position.stringIndex}-${position.fret}`)
      )
  )
}

export function noteNameAtPosition(
  position: FretPosition,
  preferFlats = false
): string {
  const names = preferFlats ? FLAT_PITCH_NAMES : SHARP_PITCH_NAMES
  return names[pitchClassAt(position.stringIndex, position.fret)]
}
