import { useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'


export default function Lesson(){
const { id } = useParams()
const { state } = useData()
const cls = state.classes.find(c => c.lessons.some(l => l.id === id))
const lesson = cls?.lessons.find(l => l.id === id)
if (!lesson) return <div>Lecție inexistentă.</div>
return (
<article className="prose max-w-none">
<h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
<p className="text-neutral-700">{lesson.content}</p>
</article>
)
}