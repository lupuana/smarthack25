import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Bubbles from './Bubbles'


export default function Layout(){
return (
<div className="min-h-screen flex relative">
	{/* Full screen animated bubbly background */}
	<Bubbles />
	<Sidebar />
	<div className="flex-1 relative">
		<Topbar />
		<main className="p-4 max-w-6xl mx-auto">
			<Outlet />
		</main>
	</div>
</div>
)
}