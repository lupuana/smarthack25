import { useAuth } from '@/context/AuthContext'
import Button from './Button'

export default function Topbar(){
	const { logout } = useAuth()
	return (
		<header className="sticky top-0 z-40 border-b border-neutral-200 px-4 py-3 flex items-center justify-between backdrop-blur-sm bg-white/70">
			<div className="font-bold text-lg gradient-text">Bloom</div>
			<div className="flex items-center gap-3">
				<div className="hidden sm:block text-xs text-neutral-600">Învățare distractivă ✨</div>
				<Button className="btn-secondary pulse-ring" onClick={logout}>Logout</Button>
			</div>
		</header>
	)
}