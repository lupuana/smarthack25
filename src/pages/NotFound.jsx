import { Link } from 'react-router-dom'


export default function NotFound(){
return (
<div className="min-h-[60vh] grid place-items-center text-center p-10">
<div>
<div className="text-3xl font-bold mb-2">404</div>
<p className="text-neutral-600 mb-4">Pagina nu există</p>
<Link className="btn" to="/dashboard">Înapoi la dashboard</Link>
</div>
</div>
)
}