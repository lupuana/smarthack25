import { SUBJECTS } from './types'


export function bootstrap() {
const classes = [
{
id: 'c1', name: 'Clasa a VII-a B', subject: 'eco',
students: [ { id: 's1', name: 'Ana L.' }, { id: 's2', name: 'Mihai C.' } ],
lessons: [ { id: 'l1', title: 'Reciclare 101', content: 'De ce, cum și când reciclăm.' } ],
quizzes: [ {
id: 'q1', title: 'Quiz Reciclare', questions: [
{ id: 'q1-1', text: 'Ce se pune la plastic?', choices: ['PET', 'Hârtie', 'Sticlă'], correctIndex: 0 },
{ id: 'q1-2', text: 'Borcanele spalate merg la…', choices: ['Metal', 'Sticlă', 'Deșeuri menajere'], correctIndex: 1 }
], submissions: []
} ]
}
]

// Activități demo (tipuri: theory, quiz, game). Pot fi filtrate după subject & level.
const activities = [
	{
		id: 'a1', title: 'Ghid Reciclare Avansat', type: 'theory', subject: 'eco', level: 'intermediar', duration: 8,
		content: 'Material extins despre colectare selectivă, coduri de reciclare și bune practici comunitare.'
	},
	{
		id: 'a2', title: 'Quiz Rapid Plastic vs Hârtie', type: 'quiz', subject: 'eco', level: 'începător', duration: 5,
		questions: [
			{ text: 'PET se reciclează la?', choices: ['Plastic', 'Sticlă', 'Hârtie'], correctIndex: 0 },
			{ text: 'Ziarul vechi merge la?', choices: ['Plastic', 'Hârtie', 'Metal'], correctIndex: 1 }
		]
	},
	{
		id: 'a3', title: 'Joc: Sortează Deșeurile', type: 'game', subject: 'eco', level: 'începător', duration: 4,
		game: { kind: 'drag-drop', goal: 'Potrivește fiecare obiect la containerul corect.' }
	},
	{
		id: 'a4', title: 'Empatie în Conversații', type: 'theory', subject: 'empathy', level: 'începător', duration: 6,
		content: 'Cum ascultăm activ, cum reformulăm și cum validăm emoțiile celorlalți.'
	},
	{
		id: 'a5', title: 'Simulare: Rezolvă Conflictul', type: 'game', subject: 'empathy', level: 'avansat', duration: 7,
		game: { kind: 'scenario', steps: 3, goal: 'Alege răspunsul care dezamorsează conflictul.' }
	},
	{
		id: 'a6', title: 'Buget de Bază', type: 'theory', subject: 'finance', level: 'începător', duration: 5,
		content: 'Ce este un buget, categorii principale și cum să urmărești cheltuielile.'
	},
	{
		id: 'a7', title: 'Quiz Economii', type: 'quiz', subject: 'finance', level: 'intermediar', duration: 6,
		questions: [
			{ text: 'Ce procent minim se recomandă la economii?', choices: ['5%', '10%', '50%'], correctIndex: 1 },
			{ text: 'Fondul de urgență acoperă câte luni?', choices: ['1-2', '3-6', '12-18'], correctIndex: 1 }
		]
	},
	{
		id: 'a8', title: 'Etică și Decizii', type: 'theory', subject: 'responsible', level: 'intermediar', duration: 9,
		content: 'Cadre morale, dileme frecvente și responsabilitate socială.'
	}
]

// Award points to a student inside a class with a log entry
// log item: { id, studentId, points, reason, at }
return { classes, subjects: SUBJECTS, activities, pointsLog: [], invites: [] }
}

export const awardPoints = (s, { classId, studentId, points, reason }) => {
	if (!classId || !studentId || !points) return s;
	return {
		...s,
		classes: s.classes.map(c => c.id === classId ? {
			...c,
			students: c.students.map(st => st.id === studentId ? {
				...st,
				points: (st.points || 0) + points
			} : st)
		} : c),
		pointsLog: [
			...s.pointsLog,
			{ id: crypto.randomUUID(), classId, studentId, points, reason, at: Date.now() }
		]
	}
}

export const createInvite = (s, classId) => {
	if (!classId) return s;
	const short = crypto.randomUUID().slice(0, 8);
	const token = `${classId}-${short}`; // include classId pentru fallback robust
	return {
		...s,
		invites: [...s.invites, { id: crypto.randomUUID(), classId, token, createdAt: Date.now(), usedBy: [] }]
	}
}

export const joinClassByToken = (s, token, student) => {
	const invite = s.invites.find(i => i.token === token);
	if (!invite) return s; // invalid
	// check duplicate
	const already = s.classes.some(c => c.id === invite.classId && c.students.some(st => st.id === student.id));
	if (already) return s;
	return {
		...s,
		classes: s.classes.map(c => c.id === invite.classId ? {
			...c,
			students: [...c.students, { id: student.id, name: student.name, points: 0 }]
		} : c),
		invites: s.invites.map(i => i.token === token ? { ...i, usedBy: [...i.usedBy, student.id] } : i)
	}
}


export const addClass = (s, { name, subject }) => ({
...s, classes: [...s.classes, { id: crypto.randomUUID(), name, subject, students: [], lessons: [], quizzes: [] }]
})


export const addStudentToClass = (s, classId, student) => ({
	...s,
	classes: s.classes.map(c =>
		c.id === classId
			? {
					...c,
					students: [
						...c.students,
						{ id: student.id || crypto.randomUUID(), ...student }
					]
				}
			: c
	)
})


export const addLesson = (s, clsId, lesson) => ({
...s,
classes: s.classes.map(c => c.id === clsId ? { ...c, lessons: [...c.lessons, { id: crypto.randomUUID(), ...lesson }] } : c)
})


export const addQuiz = (s, clsId, quiz) => ({
...s,
classes: s.classes.map(c => c.id === clsId ? { ...c, quizzes: [...c.quizzes, { id: crypto.randomUUID(), submissions: [], ...quiz }] } : c)
})


export const submitQuiz = (s, quizId, answers, userId) => ({
...s,
classes: s.classes.map(c => ({
...c,
quizzes: c.quizzes.map(q => q.id === quizId ? { ...q, submissions: [...q.submissions, { userId, answers, at: Date.now() }] } : q)
}))
})

export const deleteClass = (s, classId) => ({
	...s,
	classes: s.classes.filter(c => c.id !== classId),
	invites: (s.invites || []).filter(i => i.classId !== classId)
})