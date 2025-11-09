// src/pages/ClassDetail.jsx
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import ClassActivities from "@/components/ClassActivities.jsx";
import QuizModal from '@/components/QuizModal.jsx'
import { SUBJECT_TIPS } from '@/lib/subjectContent'
import { BADGES } from '@/lib/badges'
import Modal from '@/components/Modal.jsx'
import ProgressBar from '@/components/ProgressBar.jsx'
import { SUBJECTS } from '@/lib/types'

export default function ClassDetail(){
  const { id } = useParams()
  const { classes, awardPoints, awardBadge, createInvite, invites, activities, bonusTasks, submitBonus, approveBonus, submitQuizResult, loading, postForumMessage, assignHomework, submitHomework } = useData()
  const { user } = useAuth()

  const cls = useMemo(() => classes.find(c => c.id === id), [classes, id])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [points, setPoints] = useState(5)
  const [reason, setReason] = useState("")
  const [generatedToken, setGeneratedToken] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [bonusNote, setBonusNote] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  // Tab removed; we now always show activities then badges section.
  const [activityTab, setActivityTab] = useState('activities') // legacy state (could remove later)
  const [forumText, setForumText] = useState('')
  const [showAssign, setShowAssign] = useState(false)
  const [hwTitle, setHwTitle] = useState('Temă nouă')
  const [hwDue, setHwDue] = useState('')
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [hwEnunt, setHwEnunt] = useState('')
  const [hwNotes, setHwNotes] = useState({}) // per-homework notes for student submissions

  if (loading) {
    return (
      <div className="grid grid-cols-[220px_1fr] gap-6">
        <aside className="card p-4 h-fit">
          <div className="h-6 w-24 bg-neutral-200 rounded mb-3 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-neutral-200 rounded mb-2 animate-pulse" />
          ))}
        </aside>
        <main className="card p-6">
          <div className="h-8 bg-neutral-200 rounded mb-4 animate-pulse" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!cls) return <div className="text-red-500">Clasa nu există.</div>

  const role = user?.role?.toLowerCase?.()
  const isTeacher = role === 'teacher' || role === 'profesor' || role === 'professor'
  const lastInvite = (invites || []).filter(i => i.classId === cls.id).slice(-1)[0]

  async function onGenerateInvite(){
    const token = await createInvite(cls.id)
    setGeneratedToken(token)
  }

  const studentBase = (() => {
    try {
      const { protocol, hostname } = window.location
      return `${protocol}//${hostname}:5174`
    } catch {
      return ''
    }
  })()
  const inviteToken = generatedToken || lastInvite?.token
  const studentInviteLink = inviteToken ? `${studentBase}/join/${inviteToken}` : ''

  const currentStudent = !isTeacher ? (cls.students||[]).find(s => s.id === user?.uid || s.id === user?.id) : null

  const myBonusSubs = currentStudent ? (cls.bonusSubmissions||[]).filter(b => b.studentId === currentStudent.id) : []
  const pendingBonus = (cls.bonusSubmissions||[]).filter(b => b.status === 'pending')

  function hasSubmitted(taskId){
    return myBonusSubs.some(s => s.taskId === taskId && s.status === 'pending')
  }

  const mockProgress = [
    { label: 'Quiz 1', score: '80%' },
    { label: 'Quiz 2', score: '100%' },
    { label: 'Activitate practică', score: 'Completată' },
  ]

  // Stats for class
  const subjectDef = SUBJECTS.find(s => s.key === cls.subject)
  const students = cls.students || []
  const subs = cls.quizSubmissions || []
  const uniqSubmitters = new Set(subs.map(s => s.studentId))
  const completion = students.length ? Math.round((uniqSubmitters.size / students.length) * 100) : 0
  const lastActivity = subs.reduce((mx, s) => Math.max(mx, s.at || 0), 0)
  const quizzesCount = activities.filter(a => a.subject === cls.subject && a.type === 'quiz').length
  const quizzesForSubject = useMemo(() => activities.filter(a => a.subject === cls.subject && a.type === 'quiz'), [activities, cls.subject])
  const leaderboard = [...students].sort((a, b) => (b.points||0) - (a.points||0))
  const messages = (cls.forum || []).slice().sort((a,b) => (a.at||0) - (b.at||0))
  const badgeList = Object.values(BADGES)
  const homeworks = cls.homeworks || []
  const hwSubs = cls.homeworkSubmissions || []

  function toggleQuiz(id){
    setSelectedQuizzes(prev => prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id])
  }

  function homeworkProgress(hw){
    // percent of students who solved all quizzes in this homework
    if (!students.length) return 0
    if (hw.type === 'text'){
      const doneSet = new Set(hwSubs.filter(s => s.homeworkId === hw.id).map(s => s.studentId))
      const ok = students.filter(st => doneSet.has(st.id)).length
      return Math.round((ok / students.length) * 100)
    } else {
      const ok = students.filter(st => hw.quizIds.every(qid => subs.some(s => s.studentId === st.id && s.quizId === qid))).length
      return Math.round((ok / students.length) * 100)
    }
  }
  const badgeCounts = useMemo(() => {
    const counts = {}
    for (const st of students) {
      const bs = st.badges || []
      for (const id of bs) counts[id] = (counts[id] || 0) + 1
    }
    return counts
  }, [students])
  const totalBadgesAwarded = useMemo(() => Object.values(badgeCounts).reduce((a, b) => a + b, 0), [badgeCounts])
  const topBadgeId = useMemo(() => {
    const entries = Object.entries(badgeCounts)
    if (entries.length === 0) return null
    entries.sort((a,b)=> b[1]-a[1])
    return entries[0][0]
  }, [badgeCounts])
  const studentsWithBadges = useMemo(() => students.filter(s => (s.badges||[]).length>0).length, [students])

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      <aside className="card p-4 h-fit">
        <div className="font-semibold mb-2">Elevi înscriși</div>
        {(cls.students||[]).length === 0 && (
          <div className="text-sm text-neutral-500">Niciun elev înscris.</div>
        )}
        <ul className="grid gap-1">
          {(cls.students||[]).map(s => (
            <li key={s.id} onClick={() => setSelectedStudent(s)} className={`p-2 rounded-lg cursor-pointer border ${selectedStudent?.id===s.id ? 'bg-black text-white' : 'bg-white hover:bg-neutral-100'}`}>
              {s.name}
            </li>
          ))}
        </ul>

        {/* Insigne & statistici în bara laterală */}
        <div className="mt-5 pt-4 border-t">
          <div className="font-semibold mb-2">Insigne & statistici</div>
          {totalBadgesAwarded === 0 ? (
            <div className="text-sm text-neutral-500">Fără insigne încă.</div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-neutral-600 flex items-center justify-between">
                <span>Total insigne acordate</span>
                <span className="font-semibold">{totalBadgesAwarded}</span>
              </div>
              <div className="text-xs text-neutral-600 flex items-center justify-between">
                <span>Elevi cu insigne</span>
                <span className="font-semibold">{studentsWithBadges}/{students.length}</span>
              </div>
              {topBadgeId && (
                <div className="text-xs text-neutral-600 flex items-center justify-between">
                  <span>Insigna populară</span>
                  <span className="font-semibold">
                    {BADGES[topBadgeId]?.emoji} {BADGES[topBadgeId]?.label}
                  </span>
                </div>
              )}

              <div className="mt-3 grid grid-cols-1 gap-1 max-h-52 overflow-auto pr-1">
                {badgeList.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-xs bg-white border rounded-lg px-2 py-1">
                    <span className="flex items-center gap-1"><span>{b.emoji}</span>{b.label}</span>
                    <span className="text-neutral-700 font-medium">{badgeCounts[b.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="card p-6 space-y-8">
        {/* Header */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-pink-200 via-violet-200 to-sky-200 border border-white/40">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-2xl font-extrabold gradient-text">{cls.name}</div>
              <div className="mt-1 text-sm text-neutral-700 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white border text-xs">{subjectDef?.name || cls.subject}</span>
                {cls.createdAt && (
                  <span className="text-xs text-neutral-600">Creată: {new Date(cls.createdAt).toLocaleString?.() || '-'}</span>
                )}
              </div>
            </div>
            {isTeacher && (
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary" onClick={() => setShowAssign(true)}>Dă temă</button>
                <button className="btn btn-secondary" onClick={onGenerateInvite}>Generează link invitație</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label:'Elevi', value: students.length }, { label:'Quiz-uri', value: quizzesCount }, { label:'Submisii', value: subs.length }, { label:'% Completare', value: `${completion}%` }].map((k, i) => (
            <div key={i} className="rounded-2xl p-4 bg-white border">
              <div className="text-sm text-neutral-600">{k.label}</div>
              <div className="text-2xl font-bold">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Clasament</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[420px] text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-100">
                  <th className="py-2 pr-4">Elev</th>
                  <th className="py-2 pr-4">Puncte</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(st => (
                  <tr key={st.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{st.name}</td>
                    <td className="py-2 pr-4 font-semibold">{st.points || 0}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan={2} className="py-4 text-neutral-500">Nu există elevi încă.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {isTeacher && (
          <div className="p-4 rounded-xl border bg-neutral-50">
            <div className="font-medium mb-2">Invită elevi</div>
            {(generatedToken || lastInvite) ? (
              <div className="text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Token:</span>
                  <code className="px-2 py-1 bg-white border rounded">{generatedToken || lastInvite.token}</code>
                </div>
                <div className="mt-2 text-xs text-neutral-600 break-all flex items-center gap-2">
                  <span>Link (student, port 5174):</span>
                  <span className="px-2 py-1 bg-white border rounded inline-block">{studentInviteLink}</span>
                  <button
                    className="btn btn-secondary text-xs"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(studentInviteLink)
                      } catch {}
                    }}
                  >Copiază</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Apasă sus pe "Generează link invitație" pentru a crea un link.</div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-3">Progresul lui {selectedStudent.name}</h2>
            <ul className="grid gap-2">
              {mockProgress.map(p => (
                <li key={p.label} className="p-3 rounded-lg border bg-neutral-50">
                  <div className="font-medium">{p.label}</div>
                  <div className="text-sm text-neutral-600">{p.score}</div>
                </li>
              ))}
            </ul>

            {/* Badges catalog with owned vs missing */}
            <div className="mt-4 p-4 rounded-xl border bg-white/60">
              <div className="font-medium mb-2">Insigne (deținute vs disponibile)</div>
              <div className="flex flex-wrap gap-2">
                {Object.values(BADGES).map(b => {
                  const owned = (selectedStudent.badges || []).includes(b.id)
                  return (
                    <span
                      key={b.id}
                      className={`badge ${owned ? b.color : 'bg-neutral-100 border-neutral-300 text-neutral-400 opacity-60'} transition`}
                      title={b.desc}
                    >
                      <span className="text-base">{b.emoji}</span>
                      <span>{b.label}</span>
                    </span>
                  )
                })}
              </div>
            </div>

            {isTeacher && (
              <div className="mt-6 p-4 rounded-xl border">
                <div className="font-medium mb-3">Acordă puncte</div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input type="number" min={1} className="input" value={points} onChange={e=>setPoints(parseInt(e.target.value||'0'))} placeholder="Puncte" />
                  <input className="input md:col-span-2" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Motiv (ex: Plantează un copac)" />
                </div>
                <div className="mt-3">
                  <button className="btn" onClick={() => awardPoints({ classId: cls.id, studentId: selectedStudent.id, points: Math.max(1, points|0), reason: reason || 'Activitate' })}>Acordă puncte</button>
                  <span className="ml-3 text-sm text-neutral-600">Puncte curente: <span className="font-semibold">{selectedStudent.points || 0}</span></span>
                </div>
              </div>
            )}

            {isTeacher && (
              <div className="mt-4 p-4 rounded-xl border">
                <div className="font-medium mb-3">Acordă insignă</div>
                <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                  <select className="input" value={selectedBadge} onChange={e=>setSelectedBadge(e.target.value)}>
                    <option value="">Alege o insignă…</option>
                    {badgeList.map(b => (
                      <option key={b.id} value={b.id} disabled={(selectedStudent.badges||[]).includes(b.id)}>
                        {b.emoji} {b.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-secondary"
                    disabled={!selectedBadge || (selectedStudent.badges||[]).includes(selectedBadge)}
                    onClick={async ()=>{
                      await awardBadge({ classId: cls.id, studentId: selectedStudent.id, badgeId: selectedBadge })
                      setSelectedBadge('')
                    }}
                  >Acordă</button>
                </div>
                <div className="text-xs text-neutral-500 mt-2">Insigne recomandate: Quiz Perfect pentru scor maxim, Ajutoros pentru comportament exemplu.</div>
              </div>
            )}
          </div>
        )}

        {/* Teme (assignments) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-3">Teme</h2>
          {homeworks.length === 0 && <div className="text-sm text-neutral-500">Nu există teme încă.</div>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeworks.map(hw => (
              <div key={hw.id} className="p-4 rounded-xl border bg-white/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{hw.title || 'Temă'}</div>
                  <span className="text-xs text-neutral-600">{hw.dueAt ? `limită: ${new Date(hw.dueAt).toLocaleDateString?.()}` : ''}</span>
                </div>
                  {hw.type === 'text' ? (
                    <>
                      {hw.enunt && <div className="text-sm text-neutral-700 mb-3 whitespace-pre-line">{hw.enunt}</div>}
                      {isTeacher ? (
                          <div className="space-y-2">
                            <div className="text-xs text-neutral-700 flex items-center justify-between">
                              <span>Progres clasă</span>
                              <span className="font-semibold">{homeworkProgress(hw)}%</span>
                            </div>
                            <ProgressBar value={homeworkProgress(hw)} />
                          </div>
                      ) : currentStudent ? (
                        (() => {
                          const already = hwSubs.some(s => s.homeworkId === hw.id && s.studentId === currentStudent.id)
                          return (
                            <div className="grid gap-2">
                              <textarea
                                className="input min-h-[80px]"
                                placeholder="Răspunsul tău sau un link către document/poză"
                                value={hwNotes[hw.id] || ''}
                                onChange={e => setHwNotes(n => ({ ...n, [hw.id]: e.target.value }))}
                                disabled={already}
                              />
                              <button
                                className={`btn text-xs ${already ? 'btn-secondary opacity-70 cursor-default' : ''}`}
                                disabled={already}
                                onClick={async ()=>{
                                  await submitHomework({ classId: cls.id, homeworkId: hw.id, studentId: currentStudent.id, note: hwNotes[hw.id] || '' })
                                  setHwNotes(n => ({ ...n, [hw.id]: '' }))
                                }}
                              >{already ? 'Trimis' : 'Marchează făcut'}</button>
                            </div>
                          )
                        })()
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-neutral-600 mb-2">{hw.quizIds.length} quiz-uri</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hw.quizIds.map(qid => {
                          const q = quizzesForSubject.find(x => x.id === qid)
                          return <span key={qid} className="badge">📝 {q?.title || qid}</span>
                        })}
                      </div>
                      {isTeacher ? (
                        <div className="space-y-2">
                          <div className="text-xs text-neutral-700 flex items-center justify-between">
                            <span>Progres clasă</span>
                            <span className="font-semibold">{homeworkProgress(hw)}%</span>
                          </div>
                          <ProgressBar value={homeworkProgress(hw)} />
                        </div>
                      ) : currentStudent ? (
                        <div className="grid grid-cols-2 gap-2">
                          {hw.quizIds.map(qid => {
                            const q = quizzesForSubject.find(x => x.id === qid)
                            const solved = subs.some(s => s.studentId === currentStudent.id && s.quizId === qid)
                            return (
                              <button key={qid} className={`btn text-xs ${solved ? 'btn-secondary opacity-70 cursor-default' : ''}`} onClick={()=>!solved && setSelectedQuiz(q)}>
                                {solved ? 'Completat' : 'Rezolvă'} — {q?.title || 'Quiz'}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Activități */}
        <div className="mt-8">
          <ClassActivities
            subject={cls.subject}
            activities={activities}
            onStartQuiz={(q) => setSelectedQuiz(q)}
          />
        </div>

        {/* Insignele clasei (mereu vizibile sub activități) */}
        <div className="mt-10 space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Insignele clasei</h3>
            <p className="text-sm text-neutral-600 mb-4">Listă cu insigne disponibile și cine le deține. Profesorul poate acorda insigne din panoul elevului.</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.values(BADGES).map(b => {
                const owned = (currentStudent?.badges || []).includes(b.id)
                return (
                  <div
                    key={b.id}
                    title={`${b.desc}${owned ? ' • Deținută' : ' • Neobținută'}`}
                    className={`px-4 py-2 rounded-xl border text-sm flex items-center gap-2 bg-white/70 backdrop-blur ${b.color} ${!owned && !isTeacher ? 'opacity-50 grayscale' : ''}`}
                  >
                    <span>{b.emoji}</span>
                    <span className="font-medium">{b.label}</span>
                    {owned && !isTeacher && <span className="text-[11px] ml-1 px-1.5 py-0.5 rounded bg-black text-white">ai</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Elevi și insigne</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaderboard.map(st => (
                <div key={st.id} className="p-4 rounded-xl border bg-neutral-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{st.name}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">{st.points||0}p</span>
                  </div>
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {(st.badges||[]).length>0 ? st.badges.map(id => {
                      const b = BADGES[id]
                      return <span key={id} className={`badge ${b?.color||''}`}>{b?.emoji} {b?.label||id}</span>
                    }) : <span className="text-[11px] text-neutral-500">Fără insigne</span>}
                  </div>
                </div>
              ))}
              {leaderboard.length===0 && <div className="text-sm text-neutral-500">Nu există elevi încă.</div>}
            </div>
          </div>
        </div>

        {/* Subject theory quick tips */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Lucruri bune de știut</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(SUBJECT_TIPS[cls.subject] || []).map((tip, i) => (
              <div key={i} className="p-4 rounded-xl border bg-white/60 backdrop-blur-sm">
                <div className="text-sm leading-relaxed">{tip}</div>
              </div>
            ))}
            {(SUBJECT_TIPS[cls.subject] || []).length === 0 && (
              <div className="text-sm text-neutral-500">Nu există încă tips pentru această materie.</div>
            )}
          </div>
        </div>

        {/* Bonus tasks */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Bonusuri</h2>
          {!isTeacher && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bonusTasks.map(t => (
                <div key={t.id} className="p-4 rounded-xl border bg-neutral-50 flex flex-col">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-neutral-600 mt-1">{t.desc}</div>
                  <div className="text-xs text-neutral-500 mt-2">{t.points} puncte</div>
                  <button
                    disabled={hasSubmitted(t.id)}
                    onClick={() => submitBonus({ classId: cls.id, studentId: currentStudent.id, taskId: t.id, note: bonusNote })}
                    className={`btn mt-3 ${hasSubmitted(t.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >{hasSubmitted(t.id) ? 'Trimis pentru aprobare' : 'Marchează făcut'}</button>
                </div>
              ))}
            </div>
          )}
          {isTeacher && (
            <div className="space-y-4">
              <div className="text-sm text-neutral-600">Aprobă bonusuri trimise de elevi pentru a le acorda punctele.</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBonus.map(sub => {
                  const student = (cls.students||[]).find(s => s.id === sub.studentId)
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
                {pendingBonus.length === 0 && <div className="text-sm text-neutral-500">Nu există bonusuri în așteptare.</div>}
              </div>
            </div>
          )}
        </div>

        {/* Forumul clasei */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Forumul clasei</h2>
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-neutral-500">Încă nu sunt mesaje. Fii primul care scrie!</div>
            )}
            {messages.map(m => (
              <div key={m.id} className="p-3 rounded-xl border bg-white/60 backdrop-blur flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs">{(m.userName||'A').slice(0,1).toUpperCase()}</div>
                <div>
                  <div className="text-sm font-medium">{m.userName || 'Anonim'}</div>
                  <div className="text-sm text-neutral-700">{m.text}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{new Date(m.at||0).toLocaleString?.() || ''}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              className="input flex-1"
              placeholder="Scrie un mesaj pentru colegi..."
              value={forumText}
              onChange={e=>setForumText(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              onClick={async ()=>{
                await postForumMessage({ classId: cls.id, user, text: forumText })
                setForumText('')
              }}
            >Trimite</button>
          </div>
        </div>

        {selectedQuiz && (
          <QuizModal
            quiz={selectedQuiz}
            onClose={() => setSelectedQuiz(null)}
            onComplete={({ score, total }) => {
              if (currentStudent) {
                submitQuizResult({ classId: cls.id, studentId: currentStudent.id, quizId: selectedQuiz.id, score, total })
              }
            }}
          />
        )}

        {/* Assign homework modal */}
        {isTeacher && (
          <Modal open={showAssign} onClose={()=> setShowAssign(false)} title="Dă temă elevilor">
            <div className="grid gap-3">
              <div>
                <label className="label">Titlu</label>
                <input className="input" value={hwTitle} onChange={e=>setHwTitle(e.target.value)} placeholder="Temă la capitolul X" />
              </div>
              <div>
                <label className="label">Scadență (opțional)</label>
                <input type="date" className="input" value={hwDue} onChange={e=>setHwDue(e.target.value)} />
              </div>
              <div>
                <div className="label mb-1">Enunț (opțional dacă alegi quiz-uri)</div>
                <textarea className="input min-h-[120px]" placeholder="Scrie enunțul temei (ex: Redactează un eseu despre energie verde)" value={hwEnunt} onChange={e=>setHwEnunt(e.target.value)} />
              </div>
              <div>
                <div className="label mb-1">Alege quiz-uri (opțional)</div>
                <div className="max-h-60 overflow-auto border rounded-xl p-2 bg-neutral-50">
                  {quizzesForSubject.map(q => (
                    <label key={q.id} className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer">
                      <input type="checkbox" checked={selectedQuizzes.includes(q.id)} onChange={()=>toggleQuiz(q.id)} />
                      <span className="text-sm">{q.title}</span>
                      <span className="ml-auto text-[11px] text-neutral-500">{q.questions?.length || 0} întrebări</span>
                    </label>
                  ))}
                  {quizzesForSubject.length === 0 && <div className="text-sm text-neutral-500 p-2">Nu există quiz-uri pentru această materie.</div>}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button className="btn btn-secondary" onClick={()=> setShowAssign(false)}>Anulează</button>
                <button
                  className="btn"
                  disabled={selectedQuizzes.length === 0 && !hwEnunt}
                  onClick={async ()=>{
                    const dueAt = hwDue ? new Date(hwDue).setHours(23,59,59,999) : null
                    await assignHomework({ classId: cls.id, quizIds: selectedQuizzes, title: hwTitle, dueAt, enunt: hwEnunt })
                    setShowAssign(false)
                  }}
                >Atribuie tema</button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}
