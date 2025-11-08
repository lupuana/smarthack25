import { useMemo } from 'react'
import GameInline from '@/components/GameInline.jsx'

export default function ClassActivities({ subject, activities, onStartQuiz }) {
  const filtered = useMemo(() => (activities || []).filter(a => a.subject === subject), [activities, subject])
  const theory = filtered.filter(a => a.type === 'theory')
  const quizzes = filtered.filter(a => a.type === 'quiz')
  const games = filtered.filter(a => a.type === 'game')

  const Section = ({ title, items, empty }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(a => (
          <div key={a.id} className="card p-4 bg-gradient-to-br from-white to-neutral-50">
            <div className="font-medium mb-1">{a.title}</div>
            {a.type === 'theory' && <div className="text-xs text-neutral-600 line-clamp-3">{a.content}</div>}
            {a.type === 'quiz' && (
              <div className="text-xs text-neutral-600 flex flex-col gap-2">
                <span>{a.questions?.length} întrebări • {a.duration} min</span>
                <button
                  onClick={() => onStartQuiz && onStartQuiz(a)}
                  className="btn btn-secondary text-xs py-1"
                >Rezolvă</button>
              </div>
            )}
            {a.type === 'game' && (
              <div className="text-xs text-neutral-600">
                {a.game?.goal}
                <GameInline activity={a} />
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
              <span>{a.level}</span>
              <span>{a.duration} min</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-neutral-500 col-span-full">{empty}</div>}
      </div>
    </div>
  )

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Activități din zona clasei</h2>
      <Section title="Teorie" items={theory} empty="Nu există conținut teoretic încă." />
      <Section title="Quiz-uri" items={quizzes} empty="Nu există quiz-uri încă." />
      <Section title="Joculețe" items={games} empty="Nu există jocuri încă." />
    </div>
  )
}
