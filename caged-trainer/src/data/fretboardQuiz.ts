export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] as const

export type MajorKey = (typeof MAJOR_KEYS)[number]

export const DEGREE_NAMES = ['一', '二', '三', '四', '五', '六', '七'] as const

export const MAJOR_SCALES: Record<MajorKey, readonly string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
}

const PITCH_CLASSES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

export function noteToPitchClass(note: string): number {
  const pitchClass = PITCH_CLASSES[note]
  if (pitchClass == null) throw new Error(`无法识别音名：${note}`)
  return pitchClass
}

/** 从上到下：一弦（高音 E）到六弦（低音 E）。 */
export const OPEN_STRING_PITCH_CLASSES = [4, 11, 7, 2, 9, 4] as const

export interface FretPosition {
  stringIndex: number
  fret: number
}

export interface LocateQuestion {
  key: MajorKey
  degree: number
  targetNote: string
  targetPitchClass: number
  id: string
}

export function positionId(position: FretPosition): string {
  return `${position.stringIndex}-${position.fret}`
}

export function displayNote(note: string): string {
  return note.replace(/b/g, '♭').replace(/#/g, '♯')
}

export function pitchClassAt(stringIndex: number, fret: number): number {
  return (OPEN_STRING_PITCH_CLASSES[stringIndex] + fret) % 12
}

export function getTargetPositions(
  targetPitchClass: number,
  maxFret = 24
): FretPosition[] {
  const positions: FretPosition[] = []
  for (let stringIndex = 0; stringIndex < OPEN_STRING_PITCH_CLASSES.length; stringIndex += 1) {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      if (pitchClassAt(stringIndex, fret) === targetPitchClass) {
        positions.push({ stringIndex, fret })
      }
    }
  }
  return positions
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function makeLocateQuestion(
  keys: readonly MajorKey[],
  degrees: readonly number[],
  previousId?: string
): LocateQuestion {
  const availableKeys = keys.length > 0 ? keys : MAJOR_KEYS
  const availableDegrees = degrees.length > 0 ? degrees : [1, 2, 3, 4, 5, 6, 7]
  let question: LocateQuestion

  do {
    const key = pick(availableKeys)
    const degree = pick(availableDegrees)
    const targetNote = MAJOR_SCALES[key][degree - 1]
    question = {
      key,
      degree,
      targetNote,
      targetPitchClass: noteToPitchClass(targetNote),
      id: `${key}-${degree}`,
    }
  } while (
    question.id === previousId &&
    availableKeys.length * availableDegrees.length > 1
  )

  return question
}
