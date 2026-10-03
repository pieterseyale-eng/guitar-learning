/**
 * 形状相关类型定义（anchor-based）。
 * 约定：stringIndex 0..5 为绝对弦号（0=高音E，5=低音E）；fretOff 相对 anchorFret。
 */

export type ShapeId = 'C' | 'A' | 'G' | 'E' | 'D'

/** 形状内的一个音：绝对弦号、相对 anchor 的品偏移、度数 1..7 */
export interface Note {
  stringIndex: number
  fretOff: number
  degree: number
}

/** 一个形状的定义：shapeId + 锚定品位 + 点集 */
export interface ShapeDef {
  shapeId: ShapeId
  anchorFret: number
  notes: Note[]
}

const VALID_SHAPE_IDS: readonly string[] = ['C', 'A', 'G', 'E', 'D']

export function isShapeId(s: string): s is ShapeId {
  return VALID_SHAPE_IDS.includes(s)
}

/** 计算形状的 fretOff 范围，用于校验 anchorFret 合法区间 */
export function getShapeSpan(notes: Note[]): {
  minFretOff: number
  maxFretOff: number
} {
  if (notes.length === 0) {
    return { minFretOff: 0, maxFretOff: 0 }
  }
  let minFretOff = notes[0].fretOff
  let maxFretOff = notes[0].fretOff
  for (const n of notes) {
    if (n.fretOff < minFretOff) minFretOff = n.fretOff
    if (n.fretOff > maxFretOff) maxFretOff = n.fretOff
  }
  return { minFretOff, maxFretOff }
}
