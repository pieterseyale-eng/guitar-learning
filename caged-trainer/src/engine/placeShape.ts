/**
 * 将形状按 anchor 放置到指板绝对坐标。
 * 仅返回在范围内的点：stringIndex 0..5，fret 1..maxFret。
 *
 * Anchor-based 约定：
 * - absStringIndex = note.stringIndex（直接使用绝对弦号）
 * - absFret = anchorFret + note.fretOff
 */

import type { Note } from '../shapes/types'

const STRING_MIN = 0
const STRING_MAX = 5
const FRET_MIN = 1
export const FRET_MAX = 16

/** 放置后的一个点（含度数，便于度数题与 debug label） */
export interface PlacedNote {
  stringIndex: number
  fret: number
  degree: number
}

export function placeShape(notes: Note[], anchorFret: number): PlacedNote[] {
  const result: PlacedNote[] = []
  for (const { stringIndex, fretOff, degree } of notes) {
    const fret = anchorFret + fretOff
    if (
      stringIndex >= STRING_MIN &&
      stringIndex <= STRING_MAX &&
      fret >= FRET_MIN &&
      fret <= FRET_MAX
    ) {
      result.push({ stringIndex, fret, degree })
    }
  }
  return result
}
