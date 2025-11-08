import { Card, CardContent, CardHeader } from './Card'
import { Link } from 'react-router-dom'


export default function LessonCard({ id, title, excerpt }){
return (
<Card>
<CardHeader>
<div className="font-semibold">{title}</div>
</CardHeader>
<CardContent>
<p className="text-sm text-neutral-600">{excerpt || 'Conținut introductiv al lecției.'}</p>
<div className="mt-3">
<Link to={`/lessons/${id}`} className="btn">Deschide lecția</Link>
</div>
</CardContent>
</Card>
)
}