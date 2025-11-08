import { useState } from 'react'

// Small inline educational mini-games for activities
export default function GameInline({ activity }) {
  const kind = activity?.game?.kind

  // Drag-drop simplified quiz (map item to correct category)
  if (kind === 'drag-drop') {
    const items = [
      { name: 'Sticlă', correct: 'Sticlă' },
      { name: 'PET', correct: 'Plastic' },
      { name: 'Ziar', correct: 'Hârtie' }
    ]
    const choices = ['Plastic','Hârtie','Sticlă']
    const [step, setStep] = useState(0)
    const [score, setScore] = useState(0)
    const [done, setDone] = useState(false)
    const current = items[step]
    function pick(c){
      if (c === current.correct) setScore(s=>s+1)
      if (step + 1 >= items.length) setDone(true); else setStep(step+1)
    }
    return (
      <div className="mt-3 p-3 rounded-xl border border-neutral-200">
        {!done ? (
          <div>
            <div className="text-xs mb-2">Unde reciclezi: <span className="font-medium">{current.name}</span>?</div>
            <div className="flex gap-2 flex-wrap">
              {choices.map(c => <button key={c} onClick={()=>pick(c)} className="btn btn-secondary text-xs">{c}</button>)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">Întrebarea {step+1} / {items.length}</div>
          </div>
        ) : <div className="text-xs">Scor: {score} / {items.length}</div>}
      </div>
    )
  }

  // Scenario empathy choices
  if (kind === 'scenario') {
    const scenes = [
      { text: 'Colegul tău e supărat. Cum reacționezi?', options:[{txt:'Ignori',good:false},{txt:'Întrebi ce s-a întâmplat',good:true},{txt:'Răspunzi agresiv',good:false}] },
      { text: 'Un coleg e exclus din joc.', options:[{txt:'Îl inviți să participe',good:true},{txt:'Râzi de el',good:false},{txt:'Pleci',good:false}] }
    ]
    const [step,setStep] = useState(0)
    const [score,setScore] = useState(0)
    const [done,setDone] = useState(false)
    const cur = scenes[step]
    function choose(o){ if(o.good) setScore(s=>s+1); if(step+1>=scenes.length) setDone(true); else setStep(step+1) }
    return (
      <div className="mt-3 p-3 rounded-xl border border-neutral-200">
        {!done ? (
          <div>
            <div className="text-xs mb-2">{cur.text}</div>
            <div className="grid gap-2">
              {cur.options.map((o,i)=>(<button key={i} onClick={()=>choose(o)} className="btn btn-secondary text-xs text-left">{o.txt}</button>))}
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">Scenariul {step+1} / {scenes.length}</div>
          </div>
        ) : <div className="text-xs">Răspunsuri empatice: {score} / {scenes.length}</div>}
      </div>
    )
  }

  // Budget split (finance)
  if (kind === 'budget-split') {
    const [alloc,setAlloc] = useState({ needs:0, wants:0, savings:0 })
    const total = alloc.needs + alloc.wants + alloc.savings
    const done = total === 100
    const correct = alloc.needs===50 && alloc.wants===30 && alloc.savings===20
    function upd(field,val){ setAlloc(a=>({ ...a, [field]: Math.max(0, Math.min(100, parseInt(val||'0'))) })) }
    return (
      <div className="mt-3 p-3 rounded-xl border border-neutral-200">
        <div className="text-xs mb-2">Împarte 100: Nevoi 50 / Dorințe 30 / Economii 20</div>
        {['needs','wants','savings'].map(k=> (
          <div key={k} className="flex items-center gap-2 mb-1">
            <label className="w-20 text-[11px] capitalize">{k}</label>
            <input type="number" value={alloc[k]} onChange={e=>upd(k,e.target.value)} className="input py-1 px-2 text-xs" />
          </div>
        ))}
        <div className="text-[11px] text-neutral-600">Total: {total} / 100</div>
        {done && <div className={`mt-2 text-xs ${correct?'text-emerald-600':'text-rose-600'}`}>{correct?'Perfect!':'Reverifică proporțiile.'}</div>}
      </div>
    )
  }

  return null
}
