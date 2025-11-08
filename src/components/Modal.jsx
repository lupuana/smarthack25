import { useEffect } from 'react'


export default function Modal({ open, onClose, title, children }) {
useEffect(() => {
const onEsc = (e) => e.key === 'Escape' && onClose?.()
if (open) window.addEventListener('keydown', onEsc)
return () => window.removeEventListener('keydown', onEsc)
}, [open, onClose])
if (!open) return null
return (
<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
<div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
<div className="card-header flex items-center justify-between">
<h3 className="font-semibold">{title}</h3>
<button className="btn-secondary px-3 py-1 rounded-lg" onClick={onClose}>×</button>
</div>
<div className="card-content">{children}</div>
</div>
</div>
)
}