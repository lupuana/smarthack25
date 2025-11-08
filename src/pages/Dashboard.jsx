import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { SUBJECTS } from "@/lib/types";
import { BADGES } from "@/lib/badges";
import { getRandomFunFact } from "@/lib/funFacts";

const zones = [
  { key: "eco", title: "Îngrijirea Mediului", desc: "Reciclare, protecția naturii & sustenabilitate" },
  { key: "civic", title: "Educație Civică", desc: "Drepturi, responsabilități & participare cetățenească" },
  { key: "legal", title: "Educație Juridică", desc: "Legi, justiție & protecție juridică" },
  { key: "finance", title: "Educație Financiară", desc: "Buget, economii & decizii financiare" },
];

function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone = pct >= 70 ? 'from-emerald-500 to-lime-500' : pct >= 40 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500';
  return (
    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function TeacherDashboard() {
  const { classes: classesRaw, activities: activitiesRaw } = useData();
  const classes = classesRaw || [];
  const activities = activitiesRaw || [];

  const totals = classes.reduce(
    (acc, c) => {
      const students = (c.students || []).length;
      const classQuizzes = activities.filter(a => a.subject === c.subject && a.type === 'quiz').length;
      const subs = (c.quizSubmissions || []);
      const uniqSubmitters = new Set(subs.map(s => s.studentId));
      const clsCompletion = students ? (uniqSubmitters.size / students) * 100 : 0;
      const last = subs.reduce((mx, s) => Math.max(mx, s.at || 0), 0);

      acc.classes += 1;
      acc.students += students;
      acc.quizzes += classQuizzes;
      acc.submissions += subs.length;
      acc.avgCompletionSum += clsCompletion;
      acc.lastActivity = Math.max(acc.lastActivity, last);
      return acc;
    },
    { classes: 0, students: 0, quizzes: 0, submissions: 0, avgCompletionSum: 0, lastActivity: 0 }
  );

  const avgCompletion = totals.classes
    ? Math.round((totals.avgCompletionSum / totals.classes) * 10) / 10
    : 0;

  const subjectMap = SUBJECTS.reduce((m, s) => (m[s.key] = s, m), {});

  const classRows = classes.map((c) => {
    const students = c.students || [];
    const subs = c.quizSubmissions || [];
    const uniq = new Set(subs.map((s) => s.studentId));
    const completion = students.length ? (uniq.size / students.length) * 100 : 0;
    const last = subs.reduce((mx, s) => Math.max(mx, s.at || 0), 0);
    const subject = subjectMap[c.subject] || { name: c.subject, color: "bg-neutral-200" };
    const accent =
      c.subject === 'eco' ? 'border-emerald-400' :
      c.subject === 'empathy' ? 'border-sky-400' :
      c.subject === 'responsible' ? 'border-rose-400' :
      c.subject === 'finance' ? 'border-amber-400' : 'border-neutral-200';
    return {
      id: c.id,
      name: c.name,
      subject,
      students: students.length,
      quizzes: activities.filter(a => a.subject === c.subject && a.type === 'quiz').length,
      submissions: subs.length,
      completion,
      last,
      accent,
    };
  });

  // Aggregated leaderboard across all classes (sum of points per student id)
  const aggregateMap = {};
  classes.forEach(c => {
    (c.students || []).forEach(st => {
      if (!aggregateMap[st.id]) {
        aggregateMap[st.id] = { id: st.id, name: st.name, points: 0, classes: new Set() };
      }
      aggregateMap[st.id].points += (st.points || 0);
      aggregateMap[st.id].classes.add(c.name);
    });
  });
  const leaderboard = Object.values(aggregateMap)
    .sort((a, b) => b.points - a.points)
    .map((st, idx) => ({ ...st, rank: idx + 1, classCount: st.classes.size, classes: Array.from(st.classes) }));

  return (
    <div className="grid gap-10">
      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{
          label: 'Elevi', value: totals.students, grad: 'from-sky-400 to-blue-600', icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0Z"/></svg>
          )
        }, {
          label: 'Clase', value: totals.classes, grad: 'from-violet-400 to-fuchsia-600', icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10H3Z"/><path fill="currentColor" d="M3 19h18v2H3z"/></svg>
          )
        }, {
          label: 'Quiz-uri', value: totals.quizzes, grad: 'from-emerald-400 to-lime-600', icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M7 4h10a2 2 0 0 1 2 2v12l-7-3-7 3V6a2 2 0 0 1 2-2Z"/></svg>
          )
        }, {
          label: 'Rată medie', value: `${avgCompletion}%`, grad: 'from-amber-400 to-orange-600', icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 12h4l3 6 4-10 3 6h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ), progress: avgCompletion
        }].map((kpi, idx) => (
          <div key={idx} className={`card kpi-card overflow-hidden bg-gradient-to-br ${kpi.grad} text-white`}>
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/90">{kpi.label}</div>
                <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center bg-gradient-to-br ${kpi.grad}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold">{kpi.value}</div>
              {typeof kpi.progress === 'number' && (
                <div className="mt-2">
                  <ProgressBar value={kpi.progress} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Situație pe clase */}
      <div className="card">
        <div className="card-header">
          <div className="font-semibold">Situație pe clase</div>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-neutral-100">
                <th className="py-2 pr-4 text-neutral-600">Clasă</th>
                <th className="py-2 pr-4 text-neutral-600">Zonă</th>
                <th className="py-2 pr-4 text-neutral-600">Elevi</th>
                <th className="py-2 pr-4 text-neutral-600">Quiz-uri</th>
                <th className="py-2 pr-4 text-neutral-600">% Completare</th>
                <th className="py-2 pr-4 text-neutral-600">Submisii</th>
                <th className="py-2 pr-4 text-neutral-600">Ultima activitate</th>
                <th className="py-2 pr-2 text-neutral-600">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {classRows.map((r) => (
                <tr key={r.id} className={`border-b border-neutral-100 border-l-4 ${r.accent} table-row-hover transition-colors`}>
                  <td className="py-3 pr-4 font-medium">
                    <Link to={`/classes/${r.id}`} className="hover:underline">{r.name}</Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="badge">
                      <span className={`inline-block w-2 h-2 rounded-full ${r.subject.color}`}></span>
                      {r.subject.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{r.students}</td>
                  <td className="py-3 pr-4">{r.quizzes}</td>
                  <td className="py-3 pr-4">
                    <div className="w-40">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{Math.round(r.completion)}%</span>
                      </div>
                      <ProgressBar value={r.completion} />
                    </div>
                  </td>
                  <td className="py-3 pr-4">{r.submissions}</td>
                  <td className="py-3 pr-4 text-neutral-600">{formatDate(r.last)}</td>
                  <td className="py-3 pr-2 text-right">
                    <Link to={`/classes/${r.id}`} className="btn btn-secondary">Detalii</Link>
                  </td>
                </tr>
              ))}
              {classRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-500">Nu există încă clase adăugate.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard agregat */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="font-semibold">Leaderboard general</div>
          <div className="text-xs text-neutral-500">Total elevi: {leaderboard.length}</div>
        </div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Elev</th>
                <th className="py-2 pr-4">Puncte</th>
                <th className="py-2 pr-4">Clase</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(row => (
                <tr key={row.id} className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium w-10">{row.rank}</td>
                  <td className="py-2 pr-4">{row.name}</td>
                  <td className="py-2 pr-4 font-semibold">{row.points}</td>
                  <td className="py-2 pr-4 text-xs text-neutral-600">
                    {row.classCount === 1 ? row.classes[0] : `${row.classCount} clase`}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-neutral-500">Nu există elevi înscriși încă.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const { classes: classesRaw, activities: activitiesRaw } = useData();
  const classes = classesRaw || [];
  const activities = activitiesRaw || [];
  // găsește o clasă în care e înscris elevul (după id); dacă sunt mai multe, luăm prima
  const myClass = classes.find(c => (c.students || []).some(s => s.id === user?.uid)) || classes[0];
  const me = (myClass?.students || []).find(s => s.id === user?.uid);

  const myPoints = me?.points || 0;
  const zone = SUBJECTS.find(s => s.key === myClass?.subject);

  // activități recomandate din zona clasei
  const recs = (activities || []).filter(a => a.subject === myClass?.subject);
  const theory = recs.filter(a => a.type === 'theory').slice(0, 3);
  const quizzes = recs.filter(a => a.type === 'quiz').slice(0, 3);

  const classmates = (myClass?.students || []).sort((a,b) => (b.points||0) - (a.points||0));
  const funFact = getRandomFunFact();
  const myBadges = me?.badges || [];

  return (
    <div className="grid gap-10">
      {/* Top summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card overflow-hidden">
          <div className={`h-1 bg-${zone?.key || 'neutral'}-400`} />
          <div className="card-content">
            <div className="text-sm text-neutral-600">Clasa mea</div>
            <div className="text-2xl font-bold">{myClass?.name || '—'}</div>
            <div className="text-xs text-neutral-500 mt-1">Zona: {zone?.name || '—'}</div>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-600" />
          <div className="card-content">
            <div className="text-sm text-neutral-600">Punctele mele</div>
            <div className="text-2xl font-bold">{myPoints}</div>
            <div className="text-xs text-neutral-500 mt-1">Primești puncte din quiz-uri și bonusuri aprobate.</div>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-lime-600" />
          <div className="card-content">
            <div className="text-sm text-neutral-600">Colegi</div>
            <div className="text-2xl font-bold">{myClass?.students?.length || 0}</div>
            <div className="text-xs text-neutral-500 mt-1">În clasă cu tine.</div>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-fuchsia-400 to-violet-600" />
          <div className="card-content">
            <div className="text-sm text-neutral-600">Fun fact</div>
            <div className="mt-1 text-xs leading-relaxed text-neutral-700">{funFact || 'Astăzi nu avem fact.'}</div>
          </div>
        </div>
      </div>

      {/* Insignele mele */}
      <div className="card">
        <div className="card-header font-semibold">Insignele mele</div>
        <div className="card-content flex flex-wrap gap-2">
          {myBadges.length > 0 ? (
            myBadges.map(id => {
              const b = BADGES[id];
              return (
                <span key={id} className={`badge ${b?.color || ''}`} title={b?.desc || ''}>
                  <span className="text-base">{b?.emoji || '🎖️'}</span>
                  <span>{b?.label || id}</span>
                </span>
              )
            })
          ) : (
            <div className="text-sm text-neutral-500">Nu ai încă insigne. Încearcă un quiz pentru a câștiga una!</div>
          )}
        </div>
      </div>

      {/* Resurse recomandate */}
      <div className="card">
        <div className="card-header font-semibold">Resurse recomandate</div>
        <div className="card-content grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {theory.map(a => (
            <div key={a.id} className="p-3 rounded-xl border bg-white/60 backdrop-blur">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-neutral-600 mt-1">{a.duration} min · Teorie</div>
            </div>
          ))}
          {quizzes.map(a => (
            <div key={a.id} className="p-3 rounded-xl border bg-white/60 backdrop-blur">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-neutral-600 mt-1">{a.questions?.length} întrebări · Quiz</div>
            </div>
          ))}
          {theory.length + quizzes.length === 0 && (
            <div className="text-sm text-neutral-500">Nu sunt recomandări pentru zona ta.</div>
          )}
        </div>
      </div>

      {/* Leaderboard clasă */}
      <div className="card">
        <div className="card-header font-semibold">Clasament clasa mea</div>
        <div className="card-content overflow-x-auto">
          <table className="min-w-[380px] text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-100">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Elev</th>
                <th className="py-2 pr-4">Puncte</th>
              </tr>
            </thead>
            <tbody>
              {classmates.map((st, idx) => (
                <tr key={st.id} className="border-b border-neutral-100">
                  <td className="py-2 pr-4 w-10 font-medium">{idx + 1}</td>
                  <td className="py-2 pr-4">{st.name}</td>
                  <td className="py-2 pr-4 font-semibold">{st.points || 0}</td>
                </tr>
              ))}
              {classmates.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-neutral-500">Nu există elevi încă.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista colegi */}
      <div className="card">
        <div className="card-header font-semibold">Colegii mei</div>
        <div className="card-content grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {classmates.map(st => (
            <div key={st.id} className="p-3 rounded-xl border bg-white/50 backdrop-blur-sm flex flex-col">
              <div className="font-medium text-sm">{st.name}</div>
              <div className="text-xs text-neutral-600">{st.points || 0} puncte</div>
            </div>
          ))}
          {classmates.length === 0 && (
            <div className="text-sm text-neutral-500">Nu există colegi încă.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { classes: classesRaw } = useData();
  const role = user?.role?.toLowerCase?.();
  const isTeacher = role === "teacher" || role === "profesor" || role === "professor";
  const classes = classesRaw || [];
  const isStudent = role === 'student' || role === 'elev' || role === 'learner' || role === 'pupil';
  const myId = user?.uid || user?.id || null;
  const enrolled = isStudent && classes.some(c => (c.students||[]).some(s => s.id === myId || (!!user?.email && s.email === user.email)));

  if (isTeacher) {
    return <TeacherDashboard />;
  }
  if (isStudent) {
    return <StudentDashboard />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {zones.map((z, i) => (
        <motion.div
          key={z.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`rounded-3xl p-8 text-white shadow-lg bg-${z.key}`}
        >
          <div className="text-2xl font-bold mb-1">{z.title}</div>
          <div className="opacity-90 mb-6">{z.desc}</div>
          <Link
            to={`/classes?zone=${z.key}`}
            className="bg-white text-black font-semibold px-4 py-2 rounded-xl inline-block hover:bg-neutral-200"
          >
            Intră în zonă →
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
