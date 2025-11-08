import { db } from '@/lib/firebase'
import {
  collection, doc, onSnapshot, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, getDocs, arrayUnion, getDoc
} from 'firebase/firestore'

const classesCol = collection(db, 'classes')
const invitesCol = collection(db, 'invites')

export function subscribeData(onChange) {
  const unsubClasses = onSnapshot(classesCol, (snap) => {
    const classes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    onChange({ classes })
  })
  const unsubInvites = onSnapshot(invitesCol, (snap) => {
    const invites = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    onChange({ invites })
  })
  return () => { unsubClasses(); unsubInvites() }
}

export async function addClass({ name, subject }) {
  await addDoc(classesCol, { name, subject, students: [], lessons: [], quizzes: [] })
}

export async function deleteClass(classId) {
  await deleteDoc(doc(db, 'classes', classId))
  // cleanup invites for this class
  const q = query(invitesCol, where('classId', '==', classId))
  const res = await getDocs(q)
  await Promise.all(res.docs.map(d => deleteDoc(d.ref)))
}

export async function addStudentToClass(classId, student) {
  const ref = doc(db, 'classes', classId)
  // fetch current students list and push (simpler than arrayUnion to support updates)
  // but here we can try optimistic arrayUnion for new entries
  await updateDoc(ref, { students: arrayUnion({ id: student.id, name: student.name, points: student.points || 0 }) })
}

export async function createInvite(classId, token) {
  await addDoc(invitesCol, { classId, token, createdAt: Date.now(), usedBy: [] })
}

export async function joinClassByToken(token, student) {
  const q = query(invitesCol, where('token', '==', token))
  const res = await getDocs(q)
  if (res.empty) return null
  const invite = { id: res.docs[0].id, ...res.docs[0].data() }
  await addStudentToClass(invite.classId, { id: student.id, name: student.name, points: 0 })
  await updateDoc(doc(db, 'invites', invite.id), { usedBy: arrayUnion(student.id) })
  return invite
}

export async function awardPoints({ classId, studentId, points, reason }) {
  const ref = doc(db, 'classes', classId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()
  const students = (data.students || []).map(s => s.id === studentId ? { ...s, points: (s.points || 0) + (points || 0) } : s)
  await updateDoc(ref, { students })
}
