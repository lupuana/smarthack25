import { Card, CardContent, CardHeader } from './Card'

export default function ActivityCard({ title, badge, children }) {
	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div className="font-semibold">{title}</div>
				{badge && <span className="badge">{badge}</span>}
			</CardHeader>
			<CardContent>
				{children || <p className="text-sm text-neutral-600">Instrucțiuni scurte pentru activitate.</p>}
			</CardContent>
		</Card>
	)
}