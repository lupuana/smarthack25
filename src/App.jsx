import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import Activities from './pages/Activities'
import BadgesPage from './pages/Badges'
import Teme from './pages/Teme'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AuthRoute from './routes/AuthRoute'
import JoinClass from './pages/JoinClass'


export default function App() {
return (
<Routes>
<Route path="/login" element={<Login />} />
	<Route path="/join/:token" element={<JoinClass />} />


<Route element={<AuthRoute><Layout /></AuthRoute>}>
<Route index element={<Navigate to="/dashboard" />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/classes" element={<Classes />} />
<Route path="/classes/:id" element={<ClassDetail />} />
<Route path="/lessons/:id" element={<Lesson />} />
<Route path="/quizzes/:id" element={<Quiz />} />
<Route path="/activities" element={<Activities />} />
	<Route path="/badges" element={<BadgesPage />} />
	<Route path="/teme" element={<Teme />} />
</Route>


<Route path="*" element={<NotFound />} />
</Routes>
)
}