import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FretboardSvg, { MAX_FRET } from './FretboardSvg'
import type { FretboardDot, FretboardPosition } from './FretboardSvg'
import {
  MAJOR_KEYS,
  displayNote,
  getTargetPositions,
  makeLocateQuestion,
  positionId,
} from './data/fretboardQuiz'
import type { LocateQuestion, MajorKey } from './data/fretboardQuiz'
import {
  STRING_GROUPS,
  getLegalVoicings,
  isLegalVoicing,
  makeFunctionalChordQuestion,
  noteNameAtPosition,
} from './data/functionalChordQuiz'
import type {
  FunctionalChordQuestion,
  StringGroupLabel,
} from './data/functionalChordQuiz'
import { nextQuestion } from './engine/quiz'
import type { QuizQuestion } from './engine/quiz'
import { SHAPE_IDS } from './shapes/loadShapes'
import type { ShapeId } from './shapes/loadShapes'
import {
  COPY,
  degreeName,
  fretName,
  inversionName,
  majorKeyName,
  stringGroupName,
  stringLabel,
  stringScope,
} from './i18n'
import type { Language } from './i18n'
import './App.css'

const DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1'

type Mode = 'locate' | 'note' | 'functional' | 'shape' | 'degree'

const SHAPE_OPTIONS = ['C', 'A', 'G', 'E', 'D'] as const
const DEGREE_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const
const STRING_OPTIONS = [
  { index: 0, note: 'E' },
  { index: 1, note: 'B' },
  { index: 2, note: 'G' },
  { index: 3, note: 'D' },
  { index: 4, note: 'A' },
  { index: 5, note: 'E' },
] as const

interface LocateResult {
  isCorrect: boolean
  found: number
  targetCount: number
  extra: number
}

interface FunctionalChordResult {
  isCorrect: boolean
}

function normalizeNoteAnswer(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .toLowerCase()
}

function App() {
  const noteAnswerInputRef = useRef<HTMLInputElement>(null)
  const [language, setLanguage] = useState<Language>('zh')
  const t = COPY[language]
  const [mode, setMode] = useState<Mode>('locate')
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    nextQuestion('shape')
  )
  const [selectedKeys, setSelectedKeys] = useState<MajorKey[]>(() => [
    ...MAJOR_KEYS,
  ])
  const [selectedDegrees, setSelectedDegrees] = useState<number[]>(() => [
    ...DEGREE_OPTIONS,
  ])
  const [selectedStrings, setSelectedStrings] = useState<number[]>([5])
  const [locateQuestion, setLocateQuestion] = useState<LocateQuestion>(() =>
    makeLocateQuestion(MAJOR_KEYS, DEGREE_OPTIONS)
  )
  const [selectedPositions, setSelectedPositions] = useState<
    FretboardPosition[]
  >([])
  const [locateResult, setLocateResult] = useState<LocateResult | null>(null)
  const [noteAnswer, setNoteAnswer] = useState('')
  const [functionalQuestion, setFunctionalQuestion] =
    useState<FunctionalChordQuestion>(() => makeFunctionalChordQuestion())
  const [functionalKeys, setFunctionalKeys] = useState<MajorKey[]>(() => [
    ...MAJOR_KEYS,
  ])
  const [functionalStringGroups, setFunctionalStringGroups] = useState<
    StringGroupLabel[]
  >(() => STRING_GROUPS.map((group) => group.label))
  const [functionalPositions, setFunctionalPositions] = useState<
    FretboardPosition[]
  >([])
  const [functionalResult, setFunctionalResult] =
    useState<FunctionalChordResult | null>(null)
  const [total, setTotal] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctAnswer: string
  } | null>(null)
  const [degreeShapeIds, setDegreeShapeIds] = useState<ShapeId[]>(() => [
    ...SHAPE_IDS,
  ])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title = t.appTitle
  }, [language, t.appTitle])

  const targetPositions = useMemo(
    () =>
      getTargetPositions(locateQuestion.targetPitchClass, MAX_FRET).filter(
        (position) => selectedStrings.includes(position.stringIndex)
      ),
    [locateQuestion.targetPitchClass, selectedStrings]
  )

  const functionalLegalVoicings = useMemo(
    () => getLegalVoicings(functionalQuestion, MAX_FRET),
    [functionalQuestion]
  )

  const functionalPreferFlats = ['F', 'Bb', 'Eb'].includes(
    functionalQuestion.key
  )

  const selectedStringScope = useMemo(() => {
    const stringNumbers = [...selectedStrings]
      .sort((a, b) => a - b)
      .map((index) => index + 1)
    return stringScope(language, stringNumbers)
  }, [language, selectedStrings])

  const startLocateQuestion = useCallback(
    (
      keys: readonly MajorKey[] = selectedKeys,
      degrees: readonly number[] = selectedDegrees
    ) => {
      setLocateQuestion((previous) =>
        makeLocateQuestion(keys, degrees, previous.id)
      )
      setSelectedPositions([])
      setLocateResult(null)
      setNoteAnswer('')
      setFeedback(null)
    },
    [selectedDegrees, selectedKeys]
  )

  const startFunctionalQuestion = useCallback((
    keys: readonly MajorKey[] = functionalKeys,
    groupLabels: readonly StringGroupLabel[] = functionalStringGroups
  ) => {
    const groups = STRING_GROUPS.filter((group) =>
      groupLabels.includes(group.label)
    )
    setFunctionalQuestion((previous) =>
      makeFunctionalChordQuestion(keys, groups, previous.id)
    )
    setFunctionalPositions([])
    setFunctionalResult(null)
    setFeedback(null)
  }, [functionalKeys, functionalStringGroups])

  const goNextQuestion = useCallback(() => {
    if (mode === 'locate' || mode === 'note') {
      startLocateQuestion()
      return
    }
    if (mode === 'functional') {
      startFunctionalQuestion()
      return
    }
    const ids =
      mode === 'degree' && degreeShapeIds.length > 0
        ? degreeShapeIds
        : undefined
    setQuestion(nextQuestion(mode, ids))
    setFeedback(null)
  }, [degreeShapeIds, mode, startFunctionalQuestion, startLocateQuestion])

  useEffect(() => {
    if (mode !== 'note' || feedback == null) return

    const handleNextQuestionKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      goNextQuestion()
    }

    window.addEventListener('keydown', handleNextQuestionKey)
    const autoNextTimer = feedback.isCorrect
      ? window.setTimeout(goNextQuestion, 500)
      : null

    return () => {
      window.removeEventListener('keydown', handleNextQuestionKey)
      if (autoNextTimer != null) window.clearTimeout(autoNextTimer)
    }
  }, [feedback, goNextQuestion, mode])

  useEffect(() => {
    if (mode === 'note' && feedback == null) {
      noteAnswerInputRef.current?.focus()
    }
  }, [feedback, locateQuestion.id, mode])

  const recordAnswer = (isCorrect: boolean) => {
    setTotal((value) => value + 1)
    if (isCorrect) {
      setCorrect((value) => value + 1)
      setStreak((value) => value + 1)
    } else {
      setStreak(0)
    }
  }

  const handleCagedAnswer = (answer: string | number) => {
    if (feedback != null) return
    const correctAnswer =
      mode === 'shape'
        ? question.shapeId
        : String(question.targetDegree ?? '')
    const isCorrect = String(answer) === correctAnswer
    recordAnswer(isCorrect)
    setFeedback({ isCorrect, correctAnswer })
  }

  const handleNoteAnswer = () => {
    if (feedback != null) {
      goNextQuestion()
      return
    }
    if (normalizeNoteAnswer(noteAnswer) === '') return
    const correctAnswer = locateQuestion.targetNote
    const isCorrect =
      normalizeNoteAnswer(noteAnswer) === normalizeNoteAnswer(correctAnswer)
    recordAnswer(isCorrect)
    setFeedback({ isCorrect, correctAnswer })
  }

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return
    setMode(newMode)
    setFeedback(null)
    if (newMode === 'locate' || newMode === 'note') {
      startLocateQuestion()
      return
    }
    if (newMode === 'functional') {
      startFunctionalQuestion()
      return
    }
    const ids =
      newMode === 'degree' && degreeShapeIds.length > 0
        ? degreeShapeIds
        : undefined
    setQuestion(nextQuestion(newMode, ids))
  }

  const toggleDegreeShape = (id: ShapeId) => {
    setDegreeShapeIds((previous) =>
      previous.includes(id)
        ? previous.filter((shape) => shape !== id)
        : [...previous, id]
    )
  }

  const togglePracticeKey = (key: MajorKey) => {
    const nextKeys = selectedKeys.includes(key)
      ? selectedKeys.length === 1
        ? selectedKeys
        : selectedKeys.filter((item) => item !== key)
      : [...selectedKeys, key]
    if (nextKeys === selectedKeys) return
    setSelectedKeys(nextKeys)
    startLocateQuestion(nextKeys, selectedDegrees)
  }

  const togglePracticeDegree = (degree: number) => {
    const nextDegrees = selectedDegrees.includes(degree)
      ? selectedDegrees.length === 1
        ? selectedDegrees
        : selectedDegrees.filter((item) => item !== degree)
      : [...selectedDegrees, degree]
    if (nextDegrees === selectedDegrees) return
    setSelectedDegrees(nextDegrees)
    startLocateQuestion(selectedKeys, nextDegrees)
  }

  const togglePracticeString = (stringIndex: number) => {
    const nextStrings = selectedStrings.includes(stringIndex)
      ? selectedStrings.length === 1
        ? selectedStrings
        : selectedStrings.filter((item) => item !== stringIndex)
      : [...selectedStrings, stringIndex].sort((a, b) => a - b)
    if (nextStrings === selectedStrings) return
    setSelectedStrings(nextStrings)
    setSelectedPositions([])
    setLocateResult(null)
  }

  const toggleFunctionalKey = (key: MajorKey) => {
    const nextKeys = functionalKeys.includes(key)
      ? functionalKeys.length === 1
        ? functionalKeys
        : functionalKeys.filter((item) => item !== key)
      : [...functionalKeys, key]
    if (nextKeys === functionalKeys) return
    setFunctionalKeys(nextKeys)
    startFunctionalQuestion(nextKeys, functionalStringGroups)
  }

  const toggleFunctionalStringGroup = (label: StringGroupLabel) => {
    const nextGroups = functionalStringGroups.includes(label)
      ? functionalStringGroups.length === 1
        ? functionalStringGroups
        : functionalStringGroups.filter((item) => item !== label)
      : [...functionalStringGroups, label]
    if (nextGroups === functionalStringGroups) return
    setFunctionalStringGroups(nextGroups)
    startFunctionalQuestion(functionalKeys, nextGroups)
  }

  const toggleFretPosition = (position: FretboardPosition) => {
    if (mode !== 'locate' || locateResult != null) return
    const id = positionId(position)
    setSelectedPositions((previous) =>
      previous.some((item) => positionId(item) === id)
        ? previous.filter((item) => positionId(item) !== id)
        : [...previous, position]
    )
  }

  const submitLocateAnswer = () => {
    if (selectedPositions.length === 0 || locateResult != null) return
    const targets = new Set(targetPositions.map(positionId))
    const found = selectedPositions.filter((position) =>
      targets.has(positionId(position))
    ).length
    const extra = selectedPositions.length - found
    const isCorrect = found === targets.size && extra === 0
    recordAnswer(isCorrect)
    setLocateResult({
      isCorrect,
      found,
      targetCount: targets.size,
      extra,
    })
  }

  const toggleFunctionalPosition = (position: FretboardPosition) => {
    if (mode !== 'functional' || functionalResult != null) return
    const id = positionId(position)
    setFunctionalPositions((previous) => {
      if (previous.some((item) => positionId(item) === id)) {
        return previous.filter((item) => positionId(item) !== id)
      }
      return [
        ...previous.filter(
          (item) => item.stringIndex !== position.stringIndex
        ),
        position,
      ]
    })
  }

  const submitFunctionalAnswer = () => {
    if (functionalPositions.length !== 3 || functionalResult != null) return
    const isCorrect = isLegalVoicing(
      functionalQuestion,
      functionalPositions,
      MAX_FRET
    )
    recordAnswer(isCorrect)
    setFunctionalResult({ isCorrect })
  }

  const dots: FretboardDot[] = useMemo(() => {
    if (mode === 'locate') {
      const selectedIds = new Set(selectedPositions.map(positionId))
      if (locateResult == null) {
        return selectedPositions.map((position) => ({
          ...position,
          state: 'selected' as const,
        }))
      }

      const targetIds = new Set(targetPositions.map(positionId))
      const answerDots: FretboardDot[] = targetPositions.map((position) => ({
        ...position,
        state: selectedIds.has(positionId(position))
          ? ('correct' as const)
          : ('missed' as const),
        label: displayNote(locateQuestion.targetNote),
      }))
      selectedPositions.forEach((position) => {
        if (!targetIds.has(positionId(position))) {
          answerDots.push({ ...position, state: 'wrong', label: '×' })
        }
      })
      return answerDots
    }

    if (mode === 'functional') {
      return functionalPositions.map((position) => ({
        ...position,
        state:
          functionalResult == null
            ? ('selected' as const)
            : functionalResult.isCorrect
              ? ('correct' as const)
              : ('wrong' as const),
        label:
          functionalResult == null
            ? undefined
            : displayNote(
                noteNameAtPosition(position, functionalPreferFlats)
              ),
      }))
    }

    if (mode === 'note') return []

    if (mode === 'shape') {
      return question.placedDots.map((note) => ({
        stringIndex: note.stringIndex,
        fret: note.fret,
        state: 'default',
        label: DEBUG && note.degree != null ? String(note.degree) : undefined,
      }))
    }

    return question.placedDots.map((dot) => ({
      stringIndex: dot.stringIndex,
      fret: dot.fret,
      state: dot.highlight ? 'highlight' : 'default',
      label: DEBUG && dot.degree != null ? String(dot.degree) : undefined,
    }))
  }, [
    functionalPositions,
    functionalPreferFlats,
    functionalResult,
    locateQuestion.targetNote,
    locateResult,
    mode,
    question.placedDots,
    selectedPositions,
    targetPositions,
  ])

  const root =
    (mode === 'shape' || mode === 'degree') && DEBUG && question.root
      ? {
          stringIndex: question.root.rootStringIndex,
          fret: question.root.rootFret,
        }
      : undefined

  return (
    <main className="app" lang={language === 'zh' ? 'zh-CN' : 'en'}>
      <header className="app-header">
        <div>
          <p className="app-kicker">Guitar Learning Lab</p>
          <h1>{t.appTitle}</h1>
        </div>
        {DEBUG && <span className="app-debug-badge">DEBUG</span>}
        <div className="app-header-tools">
          <div className="language-switch" role="group" aria-label={t.language}>
            <button
              type="button"
              className={language === 'zh' ? 'active' : ''}
              aria-pressed={language === 'zh'}
              onClick={() => setLanguage('zh')}
            >
              中
            </button>
            <button
              type="button"
              className={language === 'en' ? 'active' : ''}
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
          <section className="app-stats" aria-label={t.statsAria}>
            <div><strong>{total}</strong><span>{t.total}</span></div>
            <div><strong>{correct}</strong><span>{t.correct}</span></div>
            <div><strong>{streak}</strong><span>{t.streak}</span></div>
          </section>
        </div>
      </header>

      <nav className="app-mode" aria-label={t.modesAria}>
        <button
          type="button"
          className={mode === 'locate' ? 'active' : ''}
          onClick={() => handleModeChange('locate')}
        >
          {t.locateMode}
        </button>
        <button
          type="button"
          className={mode === 'note' ? 'active' : ''}
          onClick={() => handleModeChange('note')}
        >
          {t.noteMode}
        </button>
        <button
          type="button"
          className={mode === 'functional' ? 'active' : ''}
          onClick={() => handleModeChange('functional')}
        >
          {t.functionalMode}
        </button>
        <button
          type="button"
          className={mode === 'shape' ? 'active' : ''}
          onClick={() => handleModeChange('shape')}
        >
          {t.cagedShapeMode}
        </button>
        <button
          type="button"
          className={mode === 'degree' ? 'active' : ''}
          onClick={() => handleModeChange('degree')}
        >
          {t.cagedDegreeMode}
        </button>
      </nav>

      {(mode === 'locate' || mode === 'note') && (
        <section className="locate-settings" aria-label={t.questionRange}>
          <div className="setting-row">
            <span className="setting-label">{t.key}</span>
            <div className="setting-options">
              {MAJOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={selectedKeys.includes(key) ? 'active' : ''}
                  aria-pressed={selectedKeys.includes(key)}
                  onClick={() => togglePracticeKey(key)}
                >
                  {displayNote(key)}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row">
            <span className="setting-label">{t.degree}</span>
            <div className="setting-options">
              {DEGREE_OPTIONS.map((degree) => (
                <button
                  key={degree}
                  type="button"
                  className={selectedDegrees.includes(degree) ? 'active' : ''}
                  aria-pressed={selectedDegrees.includes(degree)}
                  onClick={() => togglePracticeDegree(degree)}
                >
                  {degree}
                </button>
              ))}
            </div>
          </div>
          {mode === 'locate' && (
            <div className="setting-row string-setting-row">
              <span className="setting-label">{t.strings}</span>
              <div className="setting-options string-options">
                {STRING_OPTIONS.map((string) => (
                  <button
                    key={string.index}
                    type="button"
                    className={selectedStrings.includes(string.index) ? 'active' : ''}
                    aria-pressed={selectedStrings.includes(string.index)}
                    onClick={() => togglePracticeString(string.index)}
                  >
                    {stringLabel(language, string.index + 1, string.note)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {mode === 'functional' && (
        <section className="locate-settings" aria-label={t.functionalRange}>
          <div className="setting-row">
            <span className="setting-label">{t.key}</span>
            <div className="setting-options">
              {MAJOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={functionalKeys.includes(key) ? 'active' : ''}
                  aria-pressed={functionalKeys.includes(key)}
                  onClick={() => toggleFunctionalKey(key)}
                >
                  {displayNote(key)}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row functional-string-setting-row">
            <span className="setting-label">{t.strings}</span>
            <div className="setting-options functional-string-options">
              {STRING_GROUPS.map((group) => (
                <button
                  key={group.label}
                  type="button"
                  className={functionalStringGroups.includes(group.label) ? 'active' : ''}
                  aria-pressed={functionalStringGroups.includes(group.label)}
                  onClick={() => toggleFunctionalStringGroup(group.label)}
                >
                  {stringGroupName(language, group.label)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {mode === 'degree' && (
        <section className="app-degree-shapes">
          <span className="app-degree-shapes-label">{t.practiceShapes}</span>
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

      {(mode === 'locate' || mode === 'note') && (
        <section className="locate-question" aria-live="polite">
          <p>
            {mode === 'locate'
              ? t.locateKicker
              : t.noteKicker}
          </p>
          {mode === 'locate' ? (
            <>
              {language === 'zh' ? (
                <h2>
                  请在<strong>{selectedStringScope}</strong>上找出所有
                  <strong>{majorKeyName(language, displayNote(locateQuestion.key))}</strong>的
                  <strong>{degreeName(language, locateQuestion.degree)}</strong>
                </h2>
              ) : (
                <h2>
                  Find every <strong>{degreeName(language, locateQuestion.degree)}</strong> of{' '}
                  <strong>{majorKeyName(language, displayNote(locateQuestion.key))}</strong> on{' '}
                  <strong>{selectedStringScope}</strong>.
                </h2>
              )}
              <span>{t.clickAll}</span>
            </>
          ) : (
            language === 'zh' ? (
              <h2>
                <strong>{majorKeyName(language, displayNote(locateQuestion.key))}</strong>的
                <strong>{degreeName(language, locateQuestion.degree)}</strong>
                是什么？
              </h2>
            ) : (
              <h2>
                What is the <strong>{degreeName(language, locateQuestion.degree)}</strong> of{' '}
                <strong>{majorKeyName(language, displayNote(locateQuestion.key))}</strong>?
              </h2>
            )
          )}
        </section>
      )}

      {mode === 'functional' && (
        <section className="functional-question" aria-live="polite">
          <p>{t.functionalKicker}</p>
          <div className="functional-prompt">
            <span>
              <b>{majorKeyName(language, displayNote(functionalQuestion.key))}</b>
            </span>
            <strong>{functionalQuestion.functionSymbol}</strong>
            <span>{stringGroupName(language, functionalQuestion.stringGroup.label)}</span>
          </div>
          <h2>{t.functionalInstruction}</h2>
          <small>{t.functionalTip}</small>
        </section>
      )}

      {mode !== 'note' && (
        <section className="app-fretboard" aria-label={t.fretboardArea}>
          <div className="fretboard-scroll">
            <FretboardSvg
              language={language}
              dots={dots}
              root={root}
              interactive={mode === 'locate' || mode === 'functional'}
              disabled={
                mode === 'locate'
                  ? locateResult != null
                  : mode === 'functional'
                    ? functionalResult != null
                    : false
              }
              enabledStringIndices={
                mode === 'locate'
                  ? selectedStrings
                  : mode === 'functional'
                    ? functionalQuestion.stringGroup.stringIndices
                    : undefined
              }
              onPositionClick={
                mode === 'functional'
                  ? toggleFunctionalPosition
                  : toggleFretPosition
              }
            />
          </div>
        </section>
      )}

      {mode === 'locate' ? (
        <section className="locate-answer">
          {locateResult == null ? (
            <div className="selection-status">
              {t.selectedPositions} <strong>{selectedPositions.length}</strong> {t.positions}
            </div>
          ) : (
            <div
              className={`locate-result ${locateResult.isCorrect ? 'correct' : 'wrong'}`}
              role="status"
            >
              <strong>
                {locateResult.isCorrect ? t.allCorrect : t.checkFretboard}
              </strong>
              <span>
                {language === 'zh' ? (
                  <>
                    {majorKeyName(language, displayNote(locateQuestion.key))}的
                    {degreeName(language, locateQuestion.degree)}是{' '}
                    <b>{displayNote(locateQuestion.targetNote)}</b>，你找到了{' '}
                    {locateResult.found}/{locateResult.targetCount} 个
                    {locateResult.extra > 0 ? `，另有 ${locateResult.extra} 个错选` : ''}。
                  </>
                ) : (
                  <>
                    The {degreeName(language, locateQuestion.degree)} of{' '}
                    {majorKeyName(language, displayNote(locateQuestion.key))} is{' '}
                    <b>{displayNote(locateQuestion.targetNote)}</b>. You found{' '}
                    {locateResult.found}/{locateResult.targetCount} positions
                    {locateResult.extra > 0
                      ? `, with ${locateResult.extra} incorrect selection${locateResult.extra === 1 ? '' : 's'}`
                      : ''}.
                  </>
                )}
              </span>
            </div>
          )}

          <div className="locate-actions">
            {locateResult == null ? (
              <>
                <button
                  type="button"
                  className="secondary"
                  disabled={selectedPositions.length === 0}
                  onClick={() => setSelectedPositions([])}
                >
                  {t.clear}
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={selectedPositions.length === 0}
                  onClick={submitLocateAnswer}
                >
                  {t.submit}
                </button>
              </>
            ) : (
              <button type="button" className="primary" onClick={goNextQuestion}>
                {t.next}
              </button>
            )}
          </div>

          <div className="answer-legend" aria-label={t.colorLegend}>
            <span><i className="selected" />{t.selected}</span>
            <span><i className="correct" />{t.correct}</span>
            <span><i className="missed" />{t.missed}</span>
            <span><i className="wrong" />{t.wrong}</span>
          </div>
        </section>
      ) : mode === 'functional' ? (
        <section className="functional-answer">
          {functionalResult == null ? (
            <div className="selection-status">
              {t.selectedPositions} <strong>{functionalPositions.length}</strong> {t.selectedNotesSuffix}
            </div>
          ) : (
            <div
              className={`functional-result ${functionalResult.isCorrect ? 'correct' : 'wrong'}`}
              role="status"
            >
              <h3>
                {functionalResult.isCorrect
                  ? t.functionalCorrect
                  : t.functionalWrong}
              </h3>
              <dl className="functional-details">
                <div><dt>{t.currentKey}</dt><dd>{majorKeyName(language, displayNote(functionalQuestion.key))}</dd></div>
                <div><dt>{t.functionalChord}</dt><dd>{functionalQuestion.functionSymbol}</dd></div>
                <div><dt>{t.actualChord}</dt><dd>{displayNote(functionalQuestion.chordName)}</dd></div>
                <div><dt>{t.inversion}</dt><dd>{inversionName(language, functionalQuestion.inversion)}</dd></div>
                <div>
                  <dt>{t.targetOrder}</dt>
                  <dd>{functionalQuestion.orderedIntervals.join('–')}</dd>
                </div>
                <div className="wide">
                  <dt>{t.userNotes}</dt>
                  <dd>
                    {[...functionalPositions]
                      .sort((a, b) => b.stringIndex - a.stringIndex)
                      .map((position) =>
                        language === 'zh'
                          ? `${displayNote(noteNameAtPosition(position, functionalPreferFlats))}（${stringLabel(language, position.stringIndex + 1)}${fretName(language, position.fret)}）`
                          : `${displayNote(noteNameAtPosition(position, functionalPreferFlats))} (${stringLabel(language, position.stringIndex + 1)}, ${fretName(language, position.fret)})`
                      )
                      .join(' → ')}
                  </dd>
                </div>
              </dl>

              <div className="legal-voicings">
                <h4>
                  {t.legalPositions}
                  <span>{functionalLegalVoicings.length} {t.groups}</span>
                </h4>
                <ol>
                  {functionalLegalVoicings.map((voicing, voicingIndex) => (
                    <li key={`voicing-${voicingIndex}`}>
                      {voicing.positions.map((position, positionIndex) => {
                        const target = functionalQuestion.targets[positionIndex]
                        return (
                          <span key={`${position.stringIndex}-${position.fret}`}>
                            {language === 'zh'
                              ? `${stringLabel(language, position.stringIndex + 1)}${fretName(language, position.fret)}`
                              : `${stringLabel(language, position.stringIndex + 1)}, ${fretName(language, position.fret)}`}
                            {language === 'zh'
                              ? `（${displayNote(target.note)}）`
                              : ` (${displayNote(target.note)})`}
                          </span>
                        )
                      })}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <div className="locate-actions">
            {functionalResult == null ? (
              <>
                <button
                  type="button"
                  className="secondary"
                  disabled={functionalPositions.length === 0}
                  onClick={() => setFunctionalPositions([])}
                >
                  {t.clear}
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={functionalPositions.length !== 3}
                  onClick={submitFunctionalAnswer}
                >
                  {t.submit}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={goNextQuestion}
              >
                {t.next}
              </button>
            )}
          </div>
        </section>
      ) : mode === 'note' ? (
        <section className="note-answer-panel">
          <form
            className="note-answer-form"
            onSubmit={(event) => {
              event.preventDefault()
              handleNoteAnswer()
            }}
          >
            <label htmlFor="note-answer">{t.noteLabel}</label>
            <div className="note-input-row">
              <input
                ref={noteAnswerInputRef}
                id="note-answer"
                type="text"
                value={noteAnswer}
                disabled={feedback != null}
                autoComplete="off"
                spellCheck={false}
                autoFocus
                onChange={(event) => setNoteAnswer(event.target.value)}
              />
              <button
                type="submit"
                className="primary"
                disabled={feedback == null && normalizeNoteAnswer(noteAnswer) === ''}
              >
                {feedback == null ? t.submit : t.next}
              </button>
            </div>
          </form>

          {feedback != null && (
            <div
              className={`note-feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}
              role="status"
            >
              <strong>{feedback.isCorrect ? t.answerCorrect : t.answerWrong}</strong>
              <span>
                {language === 'zh' ? (
                  <>
                    {majorKeyName(language, displayNote(locateQuestion.key))}的
                    {degreeName(language, locateQuestion.degree)}是{' '}
                    <b>{displayNote(feedback.correctAnswer)}</b>。
                  </>
                ) : (
                  <>
                    The {degreeName(language, locateQuestion.degree)} of{' '}
                    {majorKeyName(language, displayNote(locateQuestion.key))} is{' '}
                    <b>{displayNote(feedback.correctAnswer)}</b>.
                  </>
                )}
              </span>
            </div>
          )}
          <p className="note-format-tip">{t.noteFormatTip}</p>
        </section>
      ) : (
        <>
          <section className="app-actions">
            {mode === 'shape' &&
              SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  disabled={feedback != null}
                  onClick={() => handleCagedAnswer(shape)}
                >
                  {shape}
                </button>
              ))}
            {mode === 'degree' &&
              DEGREE_OPTIONS.map((degree) => (
                <button
                  key={degree}
                  type="button"
                  disabled={feedback != null}
                  onClick={() => handleCagedAnswer(degree)}
                >
                  {degree}
                </button>
              ))}
          </section>

          <section className="app-feedback">
            {feedback === null ? (
              <p className="app-feedback-placeholder">{t.chooseAnswer}</p>
            ) : (
              <p className={feedback.isCorrect ? 'correct' : 'wrong'}>
                {feedback.isCorrect
                  ? t.correctShort
                  : `${t.wrongAnswerPrefix} ${feedback.correctAnswer}`}
              </p>
            )}
            {feedback !== null && (
              <button type="button" className="app-next" onClick={goNextQuestion}>
                {t.next}
              </button>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default App
