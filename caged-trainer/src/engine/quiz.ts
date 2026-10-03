/**
 * Quiz engine: nextQuestion(mode) 随机出题，返回题目对象。
 * 形状列表来自 SHAPES（JSON）；度数题可传入 shapeIds 只出指定形状的题。
 */

import { SHAPES } from '../shapes/loadShapes'
import type { ShapeId } from '../shapes/loadShapes'
import { placeShape } from './placeShape'

export type { ShapeId } from '../shapes/loadShapes'
export type QuizMode = 'shape' | 'degree'

/** 指板上一个已放置的点（与 FretboardSvg 的 FretboardDot 一致；degree 用于 debug label） */
export interface PlacedDot {
  stringIndex: number
  fret: number
  highlight?: boolean
  degree?: number
}

export interface QuizQuestion {
  mode: QuizMode
  shapeId: ShapeId
  placedDots: PlacedDot[]
  targetDegree?: number
  /** 当前题 anchor，用于 Debug 模式显示 */
  root?: { rootStringIndex: number; rootFret: number }
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 生成下一题。
 * @param mode - 'shape' | 'degree'
 * @param degreeShapeIds - 仅度数题有效：只从这些 shapeId 对应的形状里出题；空数组或不传表示不限制。
 */
export function nextQuestion(
  mode: QuizMode,
  degreeShapeIds?: ShapeId[]
): QuizQuestion {
  const shapes =
    mode === 'degree' &&
    degreeShapeIds != null &&
    degreeShapeIds.length > 0
      ? SHAPES.filter((s) => degreeShapeIds.includes(s.shapeId))
      : SHAPES
  if (shapes.length === 0) {
    throw new Error(
      '度数题：当前没有选中的形状，请至少勾选一个形状（C/A/G/E/D）'
    )
  }
  const shape = pick(shapes)
  const shapeId = shape.shapeId
  const anchorFret = shape.anchorFret
  const placed = placeShape(shape.notes, anchorFret)

  const root = { rootStringIndex: 5, rootFret: anchorFret }

  if (mode === 'shape') {
    return {
      mode,
      shapeId,
      placedDots: placed.map(({ stringIndex, fret, degree }) => ({
        stringIndex,
        fret,
        highlight: false,
        degree,
      })),
      root,
    }
  }

  if (placed.length === 0) {
    return { mode: 'degree', shapeId, placedDots: [], root }
  }
  const targetIndex = Math.floor(Math.random() * placed.length)
  const target = placed[targetIndex]
  const placedDots: PlacedDot[] = placed.map((d, i) => ({
    stringIndex: d.stringIndex,
    fret: d.fret,
    highlight: i === targetIndex,
    degree: d.degree,
  }))
  return {
    mode: 'degree',
    shapeId,
    placedDots,
    targetDegree: target.degree,
    root,
  }
}
