import { useState, useMemo } from 'react'
import ActivityCard from '@/components/ActivityCard'
import { useData } from '@/context/DataContext'
import { SUBJECTS } from '@/lib/types'
import QuizModal from '@/components/QuizModal'
import { useAuth } from '@/context/AuthContext'
import GameInline from '@/components/GameInline'

const TYPE_LABEL = {
	theory: 'Teorie',
	quiz: 'Quiz',
	game: 'Joculeț'
}

/* ------------------------------------------------------------------ */
/*  DEMO QUIZ DATA – 6 QUIZ-URI COMPLETE (2 NOI PENTRU CARDURILE LIPSA) */
/* ------------------------------------------------------------------ */
const DEMO_QUIZZES = [
	{
		id: 'qz1',
		type: 'quiz',
		title: 'Reciclare corectă',
		subject: 'eco',
		level: 'începător',
		duration: 5,
		questions: [
			{
				text: 'Ce se reciclează în containerul albastru?',
				options: ['Hârtie', 'Plastic', 'Sticlă', 'Organice'],
				correct: 0,
			},
			{
				text: 'Unde arunci o sticlă de plastic?',
				options: ['Reciclabil', 'Menajer', 'Sticlă', 'Compost'],
				correct: 0,
			},
			{
				text: 'Ce înseamnă simbolul cu săgeţi în cerc?',
				options: ['Reciclabil', 'Periculos', 'Organic', 'Electronic'],
				correct: 0,
			},
		],
	},
	{
		id: 'qz2',
		type: 'quiz',
		title: 'Cum economisim apa',
		subject: 'eco',
		level: 'intermediar',
		duration: 7,
		questions: [
			{
				text: 'Câtă apă consumă un duş de 5 minute cu un cap de duş econom?',
				options: ['~30 L', '~60 L', '~90 L', '~120 L'],
				correct: 0,
			},
			{
				text: 'Care este cel mai eficient mod de a spăla vasele?',
				options: [
					'Lasă robinetul deschis tot timpul',
					'Umple chiuveta şi speli în ea',
					'Speli sub jet continuu',
					'Foloseşti doar şerveţele umede',
				],
				correct: 1,
			},
			{
				text: 'Ce poţi face când îţi speli dinţii?',
				options: [
					'Ţii robinetul deschis',
					'Îţi umpli un pahar cu apă',
					'Foloseşti duşul',
					'Nu contează',
				],
				correct: 1,
			},
		],
	},
	{
		id: 'qz3',
		type: 'quiz',
		title: 'Conflicte şi empatie',
		subject: 'social',
		level: 'avansat',
		duration: 10,
		questions: [
			{
				text: 'Ce este ascultarea activă?',
				options: [
					'Îi întrerupi pe ceilalţi ca să îţi spui părerea',
					'Repetă cu propriile cuvinte ce a spus interlocutorul',
					'Îi ignori complet',
					'Îi răspunzi imediat cu soluţia',
				],
				correct: 1,
			},
			{
				text: 'Cum reacţionezi când un coleg te jigneşte?',
				options: [
					'Îi răspunzi cu aceeaşi monedă',
					'Îi spui calm că te-a rănit şi ceri explicaţii',
					'Îl ignori şi pleci',
					'Îi spui şefului',
				],
				correct: 1,
			},
			{
				text: 'Care este primul pas în rezolvarea unui conflict?',
				options: [
					'Să găseşti cine are dreptate',
					'Să calmezi emoţiile ambelor părţi',
					'Să impui o sancţiune',
					'Să ignori problema',
				],
				correct: 1,
			},
		],
	},
	{
		id: 'qz4',
		type: 'quiz',
		title: 'Cum funcţionează curentul electric',
		subject: 'stiinta',
		level: 'începător',
		duration: 6,
		questions: [
			{
				text: 'Ce este curentul electric?',
				options: [
					'Mișcarea electronilor',
					'Mișcarea protonilor',
					'Mișcarea neutronilor',
					'Mișcarea fotonilor',
				],
				correct: 0,
			},
			{
				text: 'Ce unitate măsoară tensiunea?',
				options: ['Amper', 'Volt', 'Ohm', 'Watt'],
				correct: 1,
			},
			{
				text: 'Ce face un întrerupător?',
				options: [
					'Deschide sau închide circuitul',
					'Mărește tensiunea',
					'Transformă curentul',
					'Încarcă bateria',
				],
				correct: 0,
			},
		],
	},
	// QUIZ NOU: Quiz Rapid Plastic vs Hârtie
	{
		id: 'qz5',
		type: 'quiz',
		title: 'Quiz Rapid Plastic vs Hârtie',
		subject: 'eco',
		level: 'începător',
		duration: 3,
		questions: [
			{
				text: 'Care material se descompune mai repede?',
				options: ['Plastic', 'Hârtie', 'Ambele la fel', 'Niciunul'],
				correct: 1,
			},
			{
				text: 'Câte sticle PET se pot face dintr-o tonă de plastic reciclat?',
				options: ['~100', '~500', '~25.000', '~1 milion'],
				correct: 2,
			},
			{
				text: 'Ce consumă mai multă energie la producție?',
				options: ['Hârtie', 'Plastic', 'Ambele la fel', 'Depinde de tip'],
				correct: 1,
			},
		],
	},
	// QUIZ NOU: Quiz Economii
	{
		id: 'qz6',
		type: 'quiz',
		title: 'Quiz Economii',
		subject: 'economie', // va funcționa chiar dacă nu e în SUBJECTS (doar pentru afișare)
		level: 'intermediar',
		duration: 5,
		questions: [
			{
				text: 'Ce este un buget personal?',
				options: [
					'O listă de cumpărături',
					'Un plan de venituri și cheltuieli',
					'Un cont bancar',
					'O datorie',
				],
				correct: 1,
			},
			{
				text: 'Ce înseamnă "a economisi 10%"?',
				options: [
					'Cheltui 90% din venit',
					'Cheltui 10% din economii',
					'Pui deoparte 10% din venit',
					'Împrumuți 10%',
				],
				correct: 2,
			},
			{
				text: 'Care este regula 50/30/20?',
				options: [
					'50% nevoi, 30% dorințe, 20% economii',
					'50% datorii, 30% mâncare, 20% distracție',
					'50% chirie, 30% economii, 20% restul',
					'50% investiții, 30% cheltuieli, 20% cadouri',
				],
				correct: 0,
			},
		],
	},
];

/* ------------------------------------------------------------------ */

function FilterBar({ zone, setZone, type, setType, level, setLevel, disableZone }) {
	return (
		<div className="card mb-6">
			<div className="card-content grid md:grid-cols-4 gap-4">
				<div>
					<label className="label">Zonă</label>
					<select className="input" value={zone} onChange={e => setZone(e.target.value)} disabled={disableZone}>
						<option value="">Toate</option>
						{SUBJECTS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
					</select>
				</div>
				<div>
					<label className="label">Tip</label>
					<select className="input" value={type} onChange={e => setType(e.target.value)}>
						<option value="">Toate</option>
						<option value="theory">Teorie</option>
						<option value="quiz">Quiz</option>
						<option value="game">Joculeț</option>
					</select>
				</div>
				<div>
					<label className="label">Nivel</label>
					<select className="input" value={level} onChange={e => setLevel(e.target.value)}>
						<option value="">Toate</option>
						<option value="începător">Începător</option>
						<option value="intermediar">Intermediar</option>
						<option value="avansat">Avansat</option>
					</select>
				</div>
				<div className="flex items-end">
					<button onClick={() => { setZone(''); setType(''); setLevel(''); }} className="btn btn-secondary w-full">Reset</button>
				</div>
			</div>
		</div>
	)
}

function Section({ title, children }) {
	return (
		<div className="mb-10">
			<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
				<span>{title}</span>
			</h2>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{children}
			</div>
		</div>
	)
}
// GameInline moved to a shared component: src/components/GameInline.jsx

/* removed inline QuizModal in favor of shared component */

/* ------------------------------------------------------------------ */
export default function Activities() {
	const { activities: dataActivities, classes } = useData();
	const { user } = useAuth();

	const safeClasses = (classes || []).map(c => ({ ...c, students: Array.isArray(c.students)? c.students: [] }))
	const enrolledClasses = user?.role === 'student'
		? safeClasses.filter(c => c.students.some(s => s.id === (user.uid || user.id)))
		: []
	const enrolledSubjects = enrolledClasses.map(c => c.subject)
	const defaultZone = user?.role === 'student' && enrolledSubjects.length === 1 ? enrolledSubjects[0] : ''

	/* Merge real activities with demo quizzes (demo quizzes win on duplicate id) */
	const activities = [
		...(dataActivities || []),
		...DEMO_QUIZZES,
	];

	const [zone, setZone] = useState(defaultZone);
	const [type, setType] = useState('');
	const [level, setLevel] = useState('');
	const [selectedQuiz, setSelectedQuiz] = useState(null);

	const isStudent = user?.role === 'student'

	const filtered = useMemo(() => activities.filter(a => {
		// Teacher: respect optional filters (zone can be empty meaning all)
		if (!isStudent) {
			return (!zone || a.subject === zone) && (!type || a.type === type) && (!level || a.level === level)
		}
		// Student: must be in one of enrolled subjects; ignore zone if multiple subjects
		const inEnrollment = enrolledSubjects.includes(a.subject)
		const zoneOk = (!zone || a.subject === zone) || (enrolledSubjects.length > 1 && zone === '')
		return inEnrollment && zoneOk && (!type || a.type === type) && (!level || a.level === level)
	}), [activities, zone, type, level, isStudent, enrolledSubjects]);

	const theory = filtered.filter(a => a.type === 'theory');
	const quizzes = filtered.filter(a => a.type === 'quiz');
	const games = filtered.filter(a => a.type === 'game');

	return (
		<div>
			<FilterBar zone={zone} setZone={setZone} type={type} setType={setType} level={level} setLevel={setLevel} disableZone={isStudent && enrolledSubjects.length === 1} />
			{isStudent && enrolledSubjects.length > 1 && (
				<div className="mb-6 text-xs text-neutral-600">Ești înscris(ă) în mai multe zone: {enrolledSubjects.join(', ')}. Selectează filtre pentru a restrânge lista.</div>
			)}

			<Section title="Teorie">
				{theory.map(a => (
					<ActivityCard key={a.id} title={a.title} badge={a.level}>
						<p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">{a.content}</p>
						<div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
							<span>{SUBJECTS.find(s => s.key === a.subject)?.name}</span>
							<span>{a.duration} min</span>
						</div>
					</ActivityCard>
				))}
				{theory.length === 0 && <div className="text-sm text-neutral-500">Nicio resursă teoretică pentru filtrele alese.</div>}
			</Section>

			<Section title="Quiz-uri">
				{quizzes.map(a => (
					<ActivityCard key={a.id} title={a.title} badge={a.level}>
						<p className="text-sm text-neutral-600">{a.questions?.length} întrebări • {SUBJECTS.find(s => s.key === a.subject)?.name || a.subject}</p>
						<div className="mt-3">
							<button
								onClick={() => setSelectedQuiz(a)}
								className="btn"
							>
								Rezolvă quiz
							</button>
						</div>
					</ActivityCard>
				))}
				{quizzes.length === 0 && <div className="text-sm text-neutral-500">Niciun quiz pentru filtrele alese.</div>}
			</Section>

			<Section title="Joculețe">
				{games.map(a => (
					<ActivityCard key={a.id} title={a.title} badge={a.level}>
						<div className="text-sm text-neutral-600">{a.game?.goal}</div>
						<div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
							<span>{SUBJECTS.find(s => s.key === a.subject)?.name}</span>
							<span>{a.duration} min</span>
						</div>
						<GameInline activity={a} />
					</ActivityCard>
				))}
				{games.length === 0 && <div className="text-sm text-neutral-500">Niciun joc pentru filtrele alese.</div>}
			</Section>

			{/* Quiz Modal */}
			{selectedQuiz && (
				<QuizModal
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			)}
		</div>
	)
}