import { Card, CardContent, CardHeader } from './Card'
import { Link } from 'react-router-dom'


export default function QuizCard({ id, title, count }){
return (
<Card>
<CardHeader>
<div className="font-semibold">{title}</div>
</CardHeader>
<CardContent>
<div className="text-sm text-neutral-600">{count} întrebări</div>
<div className="mt-3">
<Link to={`/quizzes/${id}`} className="btn">Start Quiz</Link>
</div>
</CardContent>
</Card>
)
}