export type Language = 'zh' | 'en'

export const COPY = {
  zh: {
    appTitle: '吉他指板训练',
    language: '语言',
    statsAria: '答题统计',
    total: '总题数',
    correct: '正确',
    streak: '连对',
    modesAria: '训练模式',
    locateMode: '级数定位',
    noteMode: '级数问答',
    functionalMode: '功能和弦',
    cagedShapeMode: 'CAGED 形状',
    cagedDegreeMode: 'CAGED 度数',
    questionRange: '出题范围',
    functionalRange: '功能和弦出题范围',
    key: '调性',
    degree: '级数',
    strings: '琴弦',
    practiceShapes: '练习形状',
    locateKicker: '级数定位 · 开放弦至 24 品',
    noteKicker: '级数问答 · 音名记忆',
    clickAll: '点击所有位置，再统一提交答案',
    functionalKicker: '功能和弦 · 三和弦转位',
    functionalInstruction: '在指定三根弦上，每根弦选择一个音',
    functionalTip: '按固定三和弦指型作答，音序从低音弦到高音弦判断',
    fretboardArea: '吉他指板答题区',
    selectedPositions: '已选择',
    positions: '个位置',
    selectedNotesSuffix: '/ 3 个音',
    allCorrect: '全部找对了！',
    checkFretboard: '再观察一下指板位置',
    clear: '清空选择',
    submit: '提交答案',
    next: '下一题',
    colorLegend: '颜色说明',
    selected: '已选择',
    missed: '漏选',
    wrong: '错选',
    functionalCorrect: '这个三和弦转位正确！',
    functionalWrong: '音名、转位顺序或固定指型不正确',
    currentKey: '当前调性',
    functionalChord: '功能和弦',
    actualChord: '实际和弦名',
    inversion: '转位类型',
    targetOrder: '目标音级顺序',
    userNotes: '用户所选音名',
    legalPositions: '全部合法指型位置',
    groups: '组',
    noteLabel: '填写音名',
    answerCorrect: '回答正确！',
    answerWrong: '这题答错了',
    noteFormatTip: '支持 ♯ / # 和 ♭ / b 两种写法',
    chooseAnswer: '请选择答案',
    correctShort: '正确！',
    wrongAnswerPrefix: '错误，正确答案是',
  },
  en: {
    appTitle: 'Guitar Fretboard Trainer',
    language: 'Language',
    statsAria: 'Quiz statistics',
    total: 'Total',
    correct: 'Correct',
    streak: 'Streak',
    modesAria: 'Training modes',
    locateMode: 'Scale Degrees',
    noteMode: 'Note Quiz',
    functionalMode: 'Functional Chords',
    cagedShapeMode: 'CAGED Shapes',
    cagedDegreeMode: 'CAGED Degrees',
    questionRange: 'Question range',
    functionalRange: 'Functional chord question range',
    key: 'Key',
    degree: 'Degree',
    strings: 'Strings',
    practiceShapes: 'Shapes',
    locateKicker: 'SCALE DEGREE LOCATION · OPEN STRINGS TO FRET 24',
    noteKicker: 'SCALE DEGREE QUIZ · NOTE RECALL',
    clickAll: 'Select every position, then submit your answer',
    functionalKicker: 'FUNCTIONAL CHORDS · TRIAD INVERSIONS',
    functionalInstruction: 'Select one note on each of the three specified strings',
    functionalTip: 'Use the fixed triad shape; notes are checked from the lowest to highest string',
    fretboardArea: 'Guitar fretboard answer area',
    selectedPositions: 'Selected',
    positions: 'positions',
    selectedNotesSuffix: '/ 3 notes',
    allCorrect: 'All positions are correct!',
    checkFretboard: 'Check the fretboard positions again',
    clear: 'Clear',
    submit: 'Submit',
    next: 'Next Question',
    colorLegend: 'Color legend',
    selected: 'Selected',
    missed: 'Missed',
    wrong: 'Incorrect',
    functionalCorrect: 'Correct triad inversion!',
    functionalWrong: 'The notes, inversion order, or fixed shape is incorrect',
    currentKey: 'Key',
    functionalChord: 'Function',
    actualChord: 'Chord',
    inversion: 'Inversion',
    targetOrder: 'Target interval order',
    userNotes: 'Your notes',
    legalPositions: 'All valid shape positions',
    groups: 'shapes',
    noteLabel: 'Enter the note name',
    answerCorrect: 'Correct!',
    answerWrong: 'Incorrect',
    noteFormatTip: 'Both ♯ / # and ♭ / b spellings are supported',
    chooseAnswer: 'Choose an answer',
    correctShort: 'Correct!',
    wrongAnswerPrefix: 'Incorrect. The correct answer is',
  },
} as const

const CHINESE_DEGREES = ['一', '二', '三', '四', '五', '六', '七'] as const
const INVERSION_NAMES = {
  zh: ['原位', '第一转位', '第二转位'],
  en: ['Root position', 'First inversion', 'Second inversion'],
} as const

export function ordinal(value: number): string {
  const remainder100 = value % 100
  if (remainder100 >= 11 && remainder100 <= 13) return `${value}th`
  if (value % 10 === 1) return `${value}st`
  if (value % 10 === 2) return `${value}nd`
  if (value % 10 === 3) return `${value}rd`
  return `${value}th`
}

export function degreeName(language: Language, degree: number): string {
  return language === 'zh'
    ? `${CHINESE_DEGREES[degree - 1]}级音`
    : `${ordinal(degree)} scale degree`
}

export function majorKeyName(language: Language, key: string): string {
  return language === 'zh' ? `${key} 大调` : `${key} Major`
}

export function stringLabel(
  language: Language,
  stringNumber: number,
  note?: string
): string {
  const suffix = note == null ? '' : ` ${note}`
  return language === 'zh'
    ? `${stringNumber}弦${suffix}`
    : `String ${stringNumber}${suffix}`
}

export function stringScope(
  language: Language,
  stringNumbers: readonly number[]
): string {
  if (stringNumbers.length === 6) {
    return language === 'zh' ? '全部琴弦' : 'all strings'
  }
  return language === 'zh'
    ? `第 ${stringNumbers.join('、')} 弦`
    : `${stringNumbers.length === 1 ? 'String' : 'Strings'} ${stringNumbers.join(', ')}`
}

export function stringGroupName(language: Language, label: string): string {
  if (language === 'zh') return label
  const numbers = label.replace(/\D/g, '').split('').join('–')
  return `Strings ${numbers}`
}

export function fretName(language: Language, fret: number): string {
  if (fret === 0) return language === 'zh' ? '空弦' : 'open'
  return language === 'zh' ? `${fret}品` : `fret ${fret}`
}

export function inversionName(language: Language, inversion: 0 | 1 | 2): string {
  return INVERSION_NAMES[language][inversion]
}
