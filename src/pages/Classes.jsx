import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

export default function Classes() {
  const { user } = useAuth();
  const { classes, addClass, deleteClass, createInvite, loading } = useData();
  const role = user?.role?.toLowerCase?.();
  const isTeacher = role === 'teacher' || role === 'profesor' || role === 'professor';

  const [name, setName] = useState("Clasa a VI-a A");
  const [subject, setSubject] = useState("eco");

  const [error, setError] = useState('');
  const onAdd = async () => {
    setError('');
    if (!name.trim()) { setError('Te rog adaugă un nume de clasă.'); return; }
    try {
      await addClass({ name, subject, teacherId: user?.uid });
      setName("");
    } catch (e) {
      console.error(e);
      setError('Nu am putut crea clasa. Încearcă din nou.');
    }
  };

  // Pentru elevi: arătăm doar clasele din care fac parte
  const myClasses = useMemo(() => {
    const list = Array.isArray(classes) ? classes : [];
    if (isTeacher) return list;
    return list.filter(c => (c.students || []).some(s => s.id === user?.uid || s.name?.toLowerCase() === user?.name?.toLowerCase()));
  }, [classes, isTeacher, user?.uid, user?.name]);

  async function handleInvite(clsId){
    try {
      const token = await createInvite(clsId);
      const u = new URL(window.location.href);
      // dev note: student app runs on 5174
      u.port = '5174';
      u.pathname = `/join/${token}`;
      await navigator.clipboard.writeText(u.toString());
      alert('Link de invitație copiat în clipboard!');
    } catch (e) {
      console.error(e);
      alert('Nu am putut genera linkul. Încearcă din nou.');
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header page with playful gradient */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-pink-200 via-violet-200 to-sky-200 border border-white/40 shadow-sm">
        <div className="text-2xl font-extrabold gradient-text">Clase</div>
        <div className="text-sm text-neutral-700 mt-1">Organizează și explorează clasele tale.</div>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-3xl border bg-white animate-pulse h-28" />
          ))}
        </div>
      )}

      {/* ✅ Formular doar pentru PROFESOR */}
      {isTeacher && (
        <div className="card">
          <div className="card-header font-semibold">Creează o clasă</div>
          <div className="card-content grid md:grid-cols-3 gap-3">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Numele clasei"
            />

            <select
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="eco">Îngrijirea Mediului</option>
              <option value="civic">Educație Civică</option>
              <option value="legal">Educație Juridică</option>
              <option value="finance">Educație Financiară</option>
            </select>

            <Button onClick={onAdd}>Adaugă</Button>
          </div>
          {error && <div className="px-4 pb-4 text-sm text-rose-600">{error}</div>}
        </div>
      )}

      {/* ✅ Lista claselor */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && myClasses.length === 0 && (
          <EmptyState
            title="Nu există clase"
            hint={isTeacher ? "Adaugă o clasă pentru a începe." : "Cere profesorului linkul de invitație pentru a te alătura unei clase."}
          />
        )}

        {myClasses.map((c) => (
          <div key={c.id} className="relative group">
            <Link
              to={`/classes/${c.id}`}
              className="card p-4 hover:shadow-lg transition block"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white border`}>{c.subject}</span>
              </div>
              <div className="text-lg font-semibold">{c.name}</div>
              <div className="text-sm text-neutral-600 mt-2">
                {(c.students||[]).length} elevi · {(c.lessons||[]).length} lecții · {(c.quizzes||[]).length} quizuri
              </div>
            </Link>
            {isTeacher && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleInvite(c.id)}
                  className="text-xs px-2 py-1 rounded bg-emerald-500 text-white"
                  title="Generează link de invitație"
                >Invită</button>
                <button
                  onClick={() => deleteClass(c.id)}
                  className="text-xs px-2 py-1 rounded bg-red-500 text-white"
                  title="Șterge clasa"
                >Șterge</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
