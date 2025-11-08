import { useState } from 'react'

// Flexible Quiz modal that supports both shapes:
// - { options: string[], correct: number }
// - { choices: string[], correctIndex: number }
export default function QuizModal({ quiz, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const q = quiz.questions[currentQuestion]
  const options = q.options || q.choices || []
  const correctIndex = typeof q.correct === 'number' ? q.correct : q.correctIndex
  const isLast = currentQuestion === quiz.questions.length - 1

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)
    const isCorrect = correctIndex === answerIndex
    let nextScore = score
    if (isCorrect) {
      nextScore = score + 1
      setScore(nextScore)
    }

    setTimeout(() => {
      if (isLast) {
        if (onComplete) onComplete({ score: nextScore, total: quiz.questions.length })
        setShowResult(true)
      } else {
        setCurrentQuestion((c) => c + 1)
        setSelectedAnswer(null)
      }
    }, 800)
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="card max-w-md w-full">
          <div className="card-content">
            <h3 className="text-xl font-bold mb-4">Quiz complet!</h3>
            <div className="text-3xl font-bold text-primary mb-2">
              {score} / {quiz.questions.length}
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Ai răspuns corect la {score} din {quiz.questions.length} întrebări.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowResult(false); setCurrentQuestion(0); setScore(0); setSelectedAnswer(null) }} className="btn flex-1">Reia quiz-ul</button>
              <button onClick={onClose} className="btn btn-secondary flex-1">Închide</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="card-content">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{quiz.title}</h3>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Întrebarea {currentQuestion + 1} din {quiz.questions.length}</span>
              <span className="font-medium">Scor: {score}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-medium mb-4">{q.text}</p>
            <div className="grid gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedAnswer === i
                      ? correctIndex === i
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                      : 'border-neutral-300 hover:border-neutral-400'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  {opt}
                  {selectedAnswer === i && correctIndex === i && (
                    <span className="ml-2 font-bold">Corect</span>
                  )}
                  {selectedAnswer === i && correctIndex !== i && (
                    <span className="ml-2 font-bold">Greșit</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedAnswer !== null && !isLast && (
            <div className="text-sm text-neutral-500 text-center italic">
              Următoarea întrebare apare în curând...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
