import { MAJOR_KEYS, MAJOR_SCALES } from './scaleData';
import type { QuizQuestion } from './types';

const NOTE_EQUIVALENTS: Record<string, string[]> = {
  C: ['C', 'B#'],
  'C#': ['C#', 'Db'],
  D: ['D'],
  'D#': ['D#', 'Eb'],
  E: ['E', 'Fb'],
  F: ['F', 'E#'],
  'F#': ['F#', 'Gb'],
  G: ['G'],
  'G#': ['G#', 'Ab'],
  A: ['A'],
  'A#': ['A#', 'Bb'],
  B: ['B', 'Cb'],
};

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function formatOrdinal(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function generateQuestion(): QuizQuestion {
  const keyName = MAJOR_KEYS[randomInt(MAJOR_KEYS.length)];
  const degree = randomInt(7) + 1;
  const correctAnswer = MAJOR_SCALES[keyName][degree - 1];

  return {
    keyName,
    degree,
    prompt: `What is the ${formatOrdinal(degree)} degree of ${keyName} major?`,
    correctAnswer,
  };
}

function normalizeNote(input: string): string {
  return input.trim().replace(/\s+/g, '').toUpperCase();
}

function canonicalize(note: string): string {
  const normalized = normalizeNote(note);

  for (const [canonical, variants] of Object.entries(NOTE_EQUIVALENTS)) {
    if (variants.map((value) => value.toUpperCase()).includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

export function isCorrectAnswer(answer: string, correctAnswer: string): boolean {
  return canonicalize(answer) === canonicalize(correctAnswer);
}
