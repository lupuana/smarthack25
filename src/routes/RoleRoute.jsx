// src/routes/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allow = ["teacher"], children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // sau un spinner
  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role || '').toLowerCase();
  const allowLower = allow.map(a => (a || '').toLowerCase());
  const teacherSynonymAllowed = allowLower.includes('teacher');
  const isTeacherSynonym = role === 'teacher' || role === 'profesor' || role === 'professor';
  const isAllowed = allowLower.includes(role) || (teacherSynonymAllowed && isTeacherSynonym);

  if (!isAllowed) return <Navigate to="/dashboard" replace />;

  return children;
}
