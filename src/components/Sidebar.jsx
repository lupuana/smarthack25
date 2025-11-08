import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

const baseLink = 'px-3 py-2 rounded-xl transition font-medium text-sm relative flex items-center gap-2'

export default function Sidebar(){
	const { user } = useAuth()
	const [collapsed, setCollapsed] = useState(() => {
		try { return localStorage.getItem('sidebarCollapsed') === '1' } catch { return false }
	})
	useEffect(() => {
		try { localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0') } catch {}
	}, [collapsed])

	const navItems = [
		{ to: '/dashboard', label: 'Dashboard', icon: '🏠' },
		{ to: '/classes', label: 'Clase', icon: '🏫' },
		{ to: '/activities', label: 'Activități', icon: '🧩' },
		{ to: '/badges', label: 'Insigne', icon: '🏅' },
		{ to: '/teme', label: 'Teme', icon: '📝' }
	]
	return (
		<aside className={`${collapsed ? 'w-20' : 'w-64'} shrink-0 p-4 border-r border-neutral-200 hidden md:block backdrop-blur-sm bg-white/70 relative transition-all`}>
			<div className="mb-4 flex items-center justify-between">
				{collapsed ? (
					<div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs font-bold">H</div>
				) : (
					<div>
						<div className="text-xl font-bold gradient-text drop-shadow-sm">HUB-UL Viitorului</div>
						<div className="text-xs text-neutral-600">Conectat ca <span className="font-semibold">{user?.name}</span> · {user?.role}</div>
					</div>
				)}
				<button
					className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
					onClick={() => setCollapsed(v => !v)}
					title={collapsed ? 'Extinde bara' : 'Restrânge bara'}
				>
					<span className="text-sm">{collapsed ? '»' : '«'}</span>
				</button>
			</div>
			<nav className="grid gap-1">
				{navItems.map(item => (
					<NavLink
						key={item.to}
						to={item.to}
						title={item.label}
						className={({ isActive }) => `${baseLink} ${isActive ? 'bg-white shadow-md ring-2 ring-pink-200/60' : 'hover:bg-white hover:shadow-sm'} ${collapsed ? 'justify-center' : ''}`}
					>
						<span className="text-base" aria-hidden>{item.icon}</span>
						{!collapsed && <span className="relative z-10">{item.label}</span>}
						<span className="absolute inset-0 rounded-xl -z-0 overflow-hidden pointer-events-none">
							<span className="absolute inset-0 opacity-0 group-[.active]:opacity-100" />
						</span>
					</NavLink>
				))}
			</nav>
		</aside>
	)
}