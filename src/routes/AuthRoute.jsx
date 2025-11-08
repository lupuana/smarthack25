import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'


export default function AuthRoute({ children }) {
const { user } = useAuth()
const loc = useLocation()
if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
return children || <Outlet />
}