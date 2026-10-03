/**
 * 形状数据唯一来源：src/data/shapes.major.json。
 * 无 mock、无硬编码；修改 JSON 后刷新页面即生效。
 * JSON 按 unknown 处理，经 type guards 校验通过后才使用，避免 TS2352。
 */

import shapesFile from '../data/shapes.major.json'
import type { ShapeId, ShapeDef, Note } from './types'
import { isShapeId } from './types'

const STRING_MIN = 0
const STRING_MAX = 5
const FRET_OFF_MIN = -2
const FRET_OFF_MAX = 12
const DEGREE_MIN = 1
const DEGREE_MAX = 7

/** 顶层文件结构 */
interface ShapesFile {
  version: number
  frets: number
  tuning: unknown
  shapes: unknown[]
}

function getNum(o: Record<string, unknown>, key: string): number | undefined {
  const v = o[key]
  return typeof v === 'number' ? v : undefined
}

function getArr(o: Record<string, unknown>, key: string): unknown[] | undefined {
  const v = o[key]
  return Array.isArray(v) ? v : undefined
}

/**
 * Type guard + 校验：note 各字段存在且范围合法，否则 throw。
 */
function assertNote(x: unknown, path: string): asserts x is Note {
  if (x == null || typeof x !== 'object') {
    throw new Error(`${path}: 应为对象`)
  }
  const o = x as Record<string, unknown>
  const si = getNum(o, 'stringIndex')
  if (si === undefined || si < STRING_MIN || si > STRING_MAX) {
    throw new Error(
      `${path}.stringIndex 必须为 ${STRING_MIN}..${STRING_MAX} 的数字，当前: ${String(o.stringIndex)}`
    )
  }
  const fo = getNum(o, 'fretOff')
  if (fo === undefined || fo < FRET_OFF_MIN || fo > FRET_OFF_MAX) {
    throw new Error(
      `${path}.fretOff 必须为 ${FRET_OFF_MIN}..${FRET_OFF_MAX} 的数字，当前: ${String(o.fretOff)}`
    )
  }
  const d = getNum(o, 'degree')
  if (d === undefined || d < DEGREE_MIN || d > DEGREE_MAX) {
    throw new Error(
      `${path}.degree 必须为 ${DEGREE_MIN}..${DEGREE_MAX} 的数字，当前: ${String(o.degree)}`
    )
  }
}

/**
 * Assertion：shape 各字段存在且范围合法，否则 throw。
 */
function assertShapeDef(x: unknown, frets: number, path: string): asserts x is ShapeDef {
  if (x == null || typeof x !== 'object') {
    throw new Error(`${path}: 应为对象`)
  }
  const o = x as Record<string, unknown>
  const sid = o.shapeId
  if (typeof sid !== 'string' || !isShapeId(sid)) {
    throw new Error(
      `${path}.shapeId 必须为 "C"|"A"|"G"|"E"|"D"，当前: ${String(sid)}`
    )
  }
  const af = getNum(o, 'anchorFret')
  if (af === undefined || af < 1 || af > frets) {
    throw new Error(
      `${path}.anchorFret 必须为 1..${frets} 的数字，当前: ${String(o.anchorFret)}`
    )
  }
  const notes = getArr(o, 'notes')
  if (notes === undefined) {
    throw new Error(`${path}.notes 必须为数组，当前: ${typeof o.notes}`)
  }
  for (let j = 0; j < notes.length; j++) {
    assertNote(notes[j], `${path}.notes[${j}]`)
  }
}

/**
 * Assertion：顶层为 { version, frets, tuning, shapes } 且字段合法，否则 throw。
 */
function assertShapesFile(data: unknown): asserts data is ShapesFile {
  if (data == null || typeof data !== 'object') {
    throw new Error('shapes.major.json: 根节点应为对象')
  }
  const o = data as Record<string, unknown>
  if (typeof o.version !== 'number') {
    throw new Error(`shapes.major.json: version 必须为数字，当前: ${typeof o.version}`)
  }
  const frets = getNum(o, 'frets')
  if (frets === undefined || frets < 1) {
    throw new Error(
      `shapes.major.json: frets 必须为 >= 1 的数字，当前: ${String(o.frets)}`
    )
  }
  if (!Array.isArray(o.tuning)) {
    throw new Error(`shapes.major.json: tuning 必须为数组，当前: ${typeof o.tuning}`)
  }
  if (!Array.isArray(o.shapes)) {
    throw new Error(`shapes.major.json: shapes 必须为数组，当前: ${typeof o.shapes}`)
  }
}

function validateAndParse(data: unknown): { shapes: ShapeDef[]; frets: number } {
  assertShapesFile(data)
  const frets = data.frets
  const result: ShapeDef[] = []
  for (let i = 0; i < data.shapes.length; i++) {
    const item = data.shapes[i]
    assertShapeDef(item, frets, `shapes[${i}]`)
    result.push(item)
  }
  return { shapes: result, frets }
}

let SHAPES: ShapeDef[]
let FRETS: number

try {
  const parsed = validateAndParse(shapesFile as unknown)
  SHAPES = parsed.shapes
  FRETS = parsed.frets
} catch (e) {
  console.error('[loadShapes] 加载形状数据失败:', e)
  throw e
}

const SHAPE_IDS_ORDER: ShapeId[] = ['C', 'A', 'G', 'E', 'D']
export const SHAPE_IDS = SHAPE_IDS_ORDER.filter((id) =>
  SHAPES.some((s) => s.shapeId === id)
)

export { SHAPES, FRETS }
export type { ShapeId, ShapeDef, Note } from './types'
export { getShapeSpan } from './types'
