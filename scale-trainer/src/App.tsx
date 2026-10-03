import { type KeyboardEvent, useState } from 'react';
import { generateQuestion, isCorrectAnswer } from './quizLogic';
import type { QuizQuestion } from './types';

interface Feedback {
  isCorrect: boolean;
  message: string;
}

function App() {
  const [question, setQuestion] = useState<QuizQuestion>(() => generateQuestion());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const checkAnswer = (): void => {
    if (!answer.trim()) {
      return;
    }

    const correct = isCorrectAnswer(answer, question.correctAnswer);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + 1);
      setFeedback({ isCorrect: true, message: 'Correct!' });
    } else {
      setFeedback({
        isCorrect: false,
        message: `Incorrect. The correct answer is ${question.correctAnswer}.`,
      });
    }
  };

  const nextQuestion = (): void => {
    setQuestion(generateQuestion());
    setAnswer('');
    setFeedback(null);
  };

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      checkAnswer();
    }
  };

  return (
    <main className="container">
      <section className="card">
        <h1>Major Scale Trainer</h1>
        <p className="score">
          Score: {score} / {attempts}
        </p>

        <p className="question">{question.prompt}</p>

        <div className="controls">
          <input
            aria-label="Answer"
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={submitOnEnter}
            placeholder="Enter note (e.g. C, F#, Bb)"
          />
          <button type="button" onClick={checkAnswer}>
            Check Answer
          </button>
        </div>

        {feedback ? (
          <p className={feedback.isCorrect ? 'feedback correct' : 'feedback incorrect'}>
            {feedback.message}
          </p>
        ) : null}

        <button type="button" className="next-button" onClick={nextQuestion}>
          Next Question
        </button>
      </section>
    </main>
  );
}

export default App;
