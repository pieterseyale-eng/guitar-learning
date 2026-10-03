import { useState, useCallback, useMemo } from 'react'
import FretboardSvg from './FretboardSvg'
import type { FretboardDot } from './FretboardSvg'
import { SHAPE_IDS } from './shapes/loadShapes'
import type { ShapeId } from './shapes/loadShapes'
import { nextQuestion } from './engine/quiz'
import type { QuizQuestion } from './engine/quiz'
import './App.css'

/** 是否开启可视化 Debug 模式：URL ?debug=1 或此处改为 true */
const DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1'

type Mode = 'shape' | 'degree'

const SHAPE_OPTIONS = ['C', 'A', 'G', 'E', 'D'] as const
const DEGREE_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const

function getInitialQuestion(mode: Mode, degreeShapeIds?: ShapeId[]): QuizQuestion {
  return nextQuestion(mode, degreeShapeIds)
}

function App() {
  const [mode, setMode] = useState<Mode>('shape')
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    getInitialQuestion('shape')
  )
  const [total, setTotal] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctAnswer: string
  } | null>(null)
  /** 度数题：只出这些 shape 的题；空数组表示不限制（全部） */
  const [degreeShapeIds, setDegreeShapeIds] = useState<ShapeId[]>(() => [...SHAPE_IDS])

  const goNextQuestion = useCallback(() => {
    const ids = mode === 'degree' && degreeShapeIds.length > 0 ? degreeShapeIds : undefined
    setQuestion(nextQuestion(mode, ids))
    setFeedback(null)
  }, [mode, degreeShapeIds])

  const handleAnswer = (answer: string | number) => {
    const correctAnswer =
      mode === 'shape'
        ? question.shapeId
        : String(question.targetDegree ?? '')
    const isCorrect = String(answer) === correctAnswer

    setTotal((t) => t + 1)
    if (isCorrect) {
      setCorrect((c) => c + 1)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
    }
    setFeedback({ isCorrect, correctAnswer })
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    const ids = newMode === 'degree' && degreeShapeIds.length > 0 ? degreeShapeIds : undefined
    setQuestion(nextQuestion(newMode, ids))
    setFeedback(null)
  }

  const toggleDegreeShape = (id: ShapeId) => {
    setDegreeShapeIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    goNextQuestion()
  }

  /** 形状题：只渲染当前 shape 的 placedNotes，全部淡色，不混入 target 逻辑 */
  const dots: FretboardDot[] = useMemo(() => {
    if (mode === 'shape') {
      return question.placedDots.map((n) => ({
        stringIndex: n.stringIndex,
        fret: n.fret,
        highlight: false,
        label: DEBUG && n.degree != null ? String(n.degree) : undefined,
      }))
    }
    return question.placedDots.map((d) => ({
      stringIndex: d.stringIndex,
      fret: d.fret,
      highlight: d.highlight ?? false,
      label: DEBUG && d.degree != null ? String(d.degree) : undefined,
    }))
  }, [mode, question.placedDots, DEBUG])

  const root =
    DEBUG && question.root
      ? {
          stringIndex: question.root.rootStringIndex,
          fret: question.root.rootFret,
        }
      : undefined

  return (
    <div className="app">
      <header className="app-header">
        <h1>CAGED 指板练习</h1>
        {DEBUG && <span className="app-debug-badge">DEBUG</span>}
      </header>

      <div className="app-mode">
        <button
          type="button"
          className={mode === 'shape' ? 'active' : ''}
          onClick={() => handleModeChange('shape')}
        >
          形状题
        </button>
        <button
          type="button"
          className={mode === 'degree' ? 'active' : ''}
          onClick={() => handleModeChange('degree')}
        >
          度数题
        </button>
      </div>

      {mode === 'degree' && (
        <section className="app-degree-shapes">
          <span className="app-degree-shapes-label">练习形状：</span>
          {SHAPE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`app-degree-shape-toggle ${degreeShapeIds.includes(id) ? 'active' : ''}`}
              onClick={() => toggleDegreeShape(id)}
            >
              {id}
            </button>
          ))}
        </section>
      )}

      <section className="app-stats">
        <span>总题数: {total}</span>
        <span>正确: {correct}</span>
        <span>连对: {streak}</span>
      </section>

      <section className="app-fretboard">
        <FretboardSvg dots={dots} root={root} />
      </section>

      <section className="app-actions">
        {mode === 'shape' &&
          SHAPE_OPTIONS.map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => handleAnswer(shape)}
            >
              {shape}
            </button>
          ))}
        {mode === 'degree' &&
          DEGREE_OPTIONS.map((d) => (
            <button key={d} type="button" onClick={() => handleAnswer(d)}>
              {d}
            </button>
          ))}
      </section>

      <section className="app-feedback">
        {feedback === null ? (
          <p className="app-feedback-placeholder">请选择答案</p>
        ) : (
          <p className={feedback.isCorrect ? 'correct' : 'wrong'}>
            {feedback.isCorrect ? '✅ 正确！' : '❌ 错误，'}
            {feedback.isCorrect ? '' : `正确答案: ${feedback.correctAnswer}`}
          </p>
        )}
        {feedback !== null && (
          <button type="button" className="app-next" onClick={handleNext}>
            下一题
          </button>
        )}
      </section>
    </div>
  )
}

export default App
