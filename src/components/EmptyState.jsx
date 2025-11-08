export default function EmptyState({ title, hint, action }){
return (
<div className="text-center p-10 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
<div className="text-lg font-semibold mb-1">{title}</div>
<div className="text-neutral-600 mb-4">{hint}</div>
{action}
</div>
)
}