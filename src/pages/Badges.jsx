import { useMemo } from 'react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { BADGES } from '@/lib/badges'

export default function BadgesPage() {
  const { classes = [], loading } = useData()
  const { user } = useAuth()

  const role = user?.role?.toLowerCase?.()
  const isTeacher = role === 'teacher' || role === 'profesor' || role === 'professor'
  const uid = user?.uid || user?.id

  const ownedClasses = useMemo(() => {
    if (!isTeacher) return []
    return classes.filter(c => (c.teacherId && (c.teacherId === uid)) || !c.teacherId)
  }, [classes, isTeacher, uid])

  const myEnrollments = useMemo(() => {
    if (isTeacher) return []
    return classes.filter(c => (c.students || []).some(s => s.id === uid))
  }, [classes, isTeacher, uid])

  const teacherStats = useMemo(() => {
    if (!isTeacher) return null
    const counts = {}
    const studentsMap = new Map()
    let studentsWithBadges = 0
    for (const c of ownedClasses) {
      for (const s of (c.students || [])) {
        const b = s.badges || []
        if (b.length > 0) studentsWithBadges++
        studentsMap.set(s.id, { id: s.id, name: s.name, count: (studentsMap.get(s.id)?.count || 0) + b.length })
        for (const id of b) counts[id] = (counts[id] || 0) + 1
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const topBadgeId = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null
    const topStudents = Array.from(studentsMap.values()).sort((a,b)=>b.count-a.count).slice(0,5)
    return { counts, total, studentsWithBadges, topBadgeId, topStudents }
  }, [ownedClasses, isTeacher])

  const studentBadges = useMemo(() => {
    if (isTeacher) return null
    const byClass = myEnrollments.map(c => {
      const me = (c.students || []).find(s => s.id === uid)
      return { cls: c, badges: me?.badges || [] }
    })
    const unique = Array.from(new Set(byClass.flatMap(x => x.badges)))
    return { byClass, unique }
  }, [myEnrollments, uid, isTeacher])

  if (loading) return <div className="card p-6">Se încarcă…</div>

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <div className="text-2xl font-bold gradient-text">Insigne</div>
        <div className="text-sm text-neutral-600">Gamificarea progresului prin insigne. Vezi catalogul și statistici.</div>
      </div>

      {/* Catalog */}
      <div className="card p-6">
        <div className="text-xl font-semibold mb-4">Catalogul de insigne</div>
        <div className="flex flex-wrap gap-3">
          {Object.values(BADGES).map(b => {
            const owned = !isTeacher && (studentBadges?.unique || []).includes(b.id)
            const cls = owned ? b.color : 'bg-neutral-100 border-neutral-300 text-neutral-400 opacity-60'
            return (
              <div key={b.id} className={`px-4 py-2 rounded-xl border text-sm flex items-center gap-2 bg-white/70 backdrop-blur ${cls}`}>
                <span>{b.emoji}</span>
                <span className="font-medium">{b.label}</span>
                <span className="text-xs text-neutral-600">{b.desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role-specific sections */}
      {isTeacher ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="text-lg font-semibold mb-3">Statistici generale</div>
            {teacherStats?.total ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total insigne acordate</span>
                  <span className="font-semibold">{teacherStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Elevi cu insigne</span>
                  <span className="font-semibold">{teacherStats.studentsWithBadges}</span>
                </div>
                {teacherStats.topBadgeId && (
                  <div className="flex items-center justify-between">
                    <span>Cea mai populară insignă</span>
                    <span className="font-semibold">{BADGES[teacherStats.topBadgeId]?.emoji} {BADGES[teacherStats.topBadgeId]?.label}</span>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-1 gap-1 max-h-64 overflow-auto pr-1">
                  {Object.values(BADGES).map(b => (
                    <div key={b.id} className="flex items-center justify-between text-xs bg-white border rounded-lg px-2 py-1">
                      <span className="flex items-center gap-1"><span>{b.emoji}</span>{b.label}</span>
                      <span className="text-neutral-700 font-medium">{teacherStats.counts[b.id] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Încă nu au fost acordate insigne.</div>
            )}
          </div>

          <div className="card p-6">
            <div className="text-lg font-semibold mb-3">Top elevi după insigne</div>
            {teacherStats?.topStudents?.length ? (
              <div className="space-y-2 text-sm">
                {teacherStats.topStudents.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                    <span>{s.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Nu există încă date suficiente.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="text-lg font-semibold mb-3">Insignele mele</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(BADGES).map(b => {
                const owned = (studentBadges?.unique || []).includes(b.id)
                return <span key={b.id} className={`badge ${owned ? b.color : 'bg-neutral-100 border-neutral-300 text-neutral-400 opacity-60'}`} title={b.desc}>{b.emoji} {b.label}</span>
              })}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold mb-3">Pe clase</div>
            {studentBadges?.byClass?.length ? (
              <div className="grid gap-3">
                {studentBadges.byClass.map(({ cls, badges }) => (
                  <div key={cls.id} className="p-3 rounded-xl border bg-neutral-50">
                    <div className="font-medium text-sm mb-2">{cls.name}</div>
                    <div className="flex flex-wrap gap-1 min-h-[28px]">
                      {badges.length ? badges.map(id => {
                        const b = BADGES[id]
                        return <span key={id} className={`badge ${b?.color||''}`}>{b?.emoji} {b?.label||id}</span>
                      }) : <span className="text-[11px] text-neutral-500">Fără insigne</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Nu ești înscris în nicio clasă sau nu ai insigne.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
