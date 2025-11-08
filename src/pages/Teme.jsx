import { useMemo, useState } from 'react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import ProgressBar from '@/components/ProgressBar'

export default function Teme() {
  const { classes = [], bonusTasks = [], submitBonus, approveBonus, loading } = useData()
  const { user } = useAuth()
  const uid = user?.uid || user?.id
  const role = user?.role?.toLowerCase?.()
  const isTeacher = role === 'teacher' || role === 'profesor' || role === 'professor'

  const ownedClasses = useMemo(() => {
    if (!isTeacher) return []
    return classes.filter(c => (c.teacherId && c.teacherId === uid) || !c.teacherId)
  }, [classes, isTeacher, uid])

  const enrolledClasses = useMemo(() => {
    if (isTeacher) return []
    return classes.filter(c => (c.students || []).some(s => s.id === uid))
  }, [classes, isTeacher, uid])

  if (loading) return <div className="card p-6">Se încarcă…</div>

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <div className="text-2xl font-bold gradient-text">Teme</div>
        <div className="text-sm text-neutral-600">Vedere centralizată pentru bonusuri / teme.</div>
      </div>

      {!isTeacher ? (
        <div className="space-y-6">
          {enrolledClasses.length === 0 && (
            <div className="card p-6 text-sm text-neutral-500">Nu ești înscris în nicio clasă.</div>
          )}
          {enrolledClasses.map(cls => {
            const me = (cls.students || []).find(s => s.id === uid)
            const mySubs = (cls.bonusSubmissions || []).filter(b => b.studentId === uid)
            const statusFor = (taskId) => mySubs.find(s => s.taskId === taskId)?.status
            return (
              <div key={cls.id} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">{cls.name}</div>
                  <Link to={`/classes/${cls.id}`} className="btn btn-secondary text-xs">Deschide clasa</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bonusTasks.map(t => {
                    const status = statusFor(t.id)
                    const disabled = status === 'pending' || status === 'approved'
                    return (
                      <div key={t.id} className="p-4 rounded-xl border bg-neutral-50 flex flex-col">
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-neutral-600 mt-1">{t.desc}</div>
                        <div className="text-xs text-neutral-500 mt-2">{t.points} puncte</div>
                        <button
                          disabled={disabled}
                          onClick={() => submitBonus({ classId: cls.id, studentId: me?.id, taskId: t.id, note: '' })}
                          className={`btn mt-3 text-xs ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >{status === 'pending' ? 'Trimis' : status === 'approved' ? 'Aprobat' : 'Marchează făcut'}</button>
                      </div>
                    )
                  })}
                  {bonusTasks.length === 0 && <div className="text-sm text-neutral-500">Nu există teme/bonusuri definite.</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {ownedClasses.length === 0 && (
            <div className="card p-6 text-sm text-neutral-500">Nu deții încă nicio clasă.</div>
          )}
          {ownedClasses.map(cls => {
            const pending = (cls.bonusSubmissions || []).filter(b => b.status === 'pending')
            const hw = cls.homeworks || []
            return (
              <div key={cls.id} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">{cls.name}</div>
                  <Link to={`/classes/${cls.id}`} className="btn btn-secondary text-xs">Deschide clasa</Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map(sub => {
                    const student = (cls.students || []).find(s => s.id === sub.studentId)
                    const task = bonusTasks.find(t => t.id === sub.taskId)
                    return (
                      <div key={sub.id} className="p-4 rounded-xl border">
                        <div className="font-medium flex items-center justify-between">
                          <span>{task?.title}</span>
                          <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">{task?.points}p</span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-1">Elev: {student?.name || '—'}</div>
                        {sub.note && <div className="text-xs text-neutral-500 mt-1 italic">{sub.note}</div>}
                        <button onClick={() => approveBonus({ classId: cls.id, submissionId: sub.id })} className="btn btn-secondary mt-3 text-xs">Aprobă</button>
                      </div>
                    )
                  })}
                  {pending.length === 0 && <div className="text-sm text-neutral-500">Nu există cereri în așteptare.</div>}
                </div>

                {hw.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">Teme active</div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hw.map(h => {
                        const students = cls.students || []
                        const subs = cls.quizSubmissions || []
                        const hwSubs = cls.homeworkSubmissions || []
                        const pct = (()=>{
                          if (!students.length) return 0
                          if (h.type === 'text'){
                            const done = new Set(hwSubs.filter(s => s.homeworkId === h.id).map(s => s.studentId))
                            const ok = students.filter(st => done.has(st.id)).length
                            return Math.round((ok / students.length) * 100)
                          } else {
                            const ok = students.filter(st => h.quizIds.every(qid => subs.some(s => s.studentId === st.id && s.quizId === qid))).length
                            return Math.round((ok / students.length) * 100)
                          }
                        })()
                        return (
                          <div key={h.id} className="p-3 rounded-xl border bg-white/70">
                            <div className="text-sm font-medium flex items-center justify-between mb-1">
                              <span>{h.title || 'Temă'}</span>
                              <span className="text-[11px] text-neutral-600">{pct}%</span>
                            </div>
                            <ProgressBar value={pct} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
