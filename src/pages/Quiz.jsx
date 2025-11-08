import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import Button from '@/components/Button'


export default function Quiz(){
const { id } = useParams()
const nav = useNavigate()
const { user } = useAuth()
const { state, submitQuiz } = useData()
const quiz = useMemo(() => state.classes.flatMap(c=>c.quizzes).find(q=>q.id===id), [state, id])
const [answers, setAnswers] = useState({})


if (!quiz) return <div>Quiz inexistent.</div>


const onSubmit = () => {
submitQuiz(quiz.id, answers, user.id)
nav('/classes')
}


return (
<div className="card">
<div className="card-header font-semibold">{quiz.title}</div>
<div className="card-content grid gap-4">
{quiz.questions.map((q, idx) => (
<div key={q.id}>
<div className="font-medium mb-2">{idx+1}. {q.text}</div>
<div className="grid gap-2">
{q.choices.map((c, i) => (
<label key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${answers[q.id]===i?'border-black':'border-neutral-200'}`}>
<input type="radio" name={q.id} checked={answers[q.id]===i} onChange={()=>setAnswers(a=>({...a,[q.id]:i}))} />
{c}
</label>
))}
</div>
</div>
))}
<Button onClick={onSubmit}>Trimite</Button>
</div>
</div>
)
}