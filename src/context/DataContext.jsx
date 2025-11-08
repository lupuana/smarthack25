import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, updateDoc, doc, getDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import * as api from '@/lib/fakeApi'
import { badgeFromQuiz, ensureBadgeList } from '@/lib/badges'

// Firestore collections
const classesCol = collection(db, 'classes')
const invitesCol = collection(db, 'invites')


const DataCtx = createContext()


export function DataProvider({ children }) {
  const [classes, setClasses] = useState([])
  const [invites, setInvites] = useState([])
  const [activities] = useState(() => api.bootstrap().activities)
  const [bonusTasks] = useState(() => ([
    { id: 'b1', title: 'Plantează un copac', points: 15, desc: 'Arată unde ai plantat și cum îl îngrijești.' },
    { id: 'b2', title: 'Udat flori', points: 5, desc: 'Udă florile din curtea școlii sau acasă.' },
    { id: 'b3', title: 'Strâns gunoi în parc', points: 10, desc: 'Adună gunoiul dintr-o zonă și arată rezultatul.' }
  ]))
  const [loading, setLoading] = useState(true)

  // Subscribe real-time
  useEffect(() => {
    const unsubClasses = onSnapshot(classesCol, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubInvites = onSnapshot(invitesCol, snap => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    setLoading(false)
    return () => { unsubClasses(); unsubInvites() }
  }, [])

  // Actions
  async function addClass({ name, subject, teacherId }) {
    await addDoc(classesCol, { name, subject, teacherId: teacherId || null, students: [], lessons: [], quizzes: [], createdAt: Date.now() })
  }

  async function addStudentToClass(classId, student){
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const exists = (data.students || []).some(s => s.id === student.id)
    if (exists) return
    const students = [ ...(data.students || []), { id: student.id, name: student.name, email: student.email || null, points: student.points || 0, badges: [] } ]
    await updateDoc(ref, { students })
  }

  async function awardPoints({ classId, studentId, points, reason }) {
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const students = (data.students || []).map(s => s.id === studentId ? { ...s, points: (s.points || 0) + (points || 0) } : s)
    await updateDoc(ref, { students })
  }

  async function createInvite(classId){
    const token = `${classId}-${nanoid(8)}`
    await addDoc(invitesCol, { classId, token, createdAt: Date.now(), usedBy: [] })
    return token
  }

  async function joinClassByToken(token, student){
    const q = query(invitesCol, where('token','==',token))
    const res = await getDocs(q)
    if (res.empty) return { ok:false, error:'Invitație invalidă' }
    const inviteDoc = res.docs[0]
    const { classId } = inviteDoc.data()
    await addStudentToClass(classId, { id: student.id, name: student.name, points:0 })
    await updateDoc(inviteDoc.ref, { usedBy: [...(inviteDoc.data().usedBy||[]), student.id] })
    return { ok:true, classId }
  }

  async function deleteClass(classId){
    await deleteDoc(doc(db, 'classes', classId))
    // cleanup invites for this class
    const qInv = query(invitesCol, where('classId','==',classId))
    const res = await getDocs(qInv)
    await Promise.all(res.docs.map(d => deleteDoc(d.ref)))
  }

  // Record a quiz submission and award points to the student
  async function submitQuizResult({ classId, studentId, quizId, score, total }){
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const quizSubmissions = [ ...(data.quizSubmissions || []), { id: nanoid(10), studentId, quizId, score, total, at: Date.now() } ]
    const students = (data.students || []).map(s => {
      if (s.id !== studentId) return s
      const nextPoints = (s.points || 0) + (score || 0)
      const nextBadges = ensureBadgeList(s.badges)
      const auto = badgeFromQuiz(score, total)
      const withAuto = auto && !nextBadges.includes(auto) ? [...nextBadges, auto] : nextBadges
      return { ...s, points: nextPoints, badges: withAuto }
    })
    await updateDoc(ref, { quizSubmissions, students })
  }

  // Bonus tasks: student submits, teacher approves and student gets points
  async function submitBonus({ classId, studentId, taskId, note }){
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const bonusSubmissions = [ ...(data.bonusSubmissions || []), { id: nanoid(10), studentId, taskId, note: note || '', status: 'pending', at: Date.now() } ]
    await updateDoc(ref, { bonusSubmissions })
  }

  async function approveBonus({ classId, submissionId }){
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const submission = (data.bonusSubmissions || []).find(s => s.id === submissionId)
    if (!submission) return
    const task = (bonusTasks || []).find(t => t.id === submission.taskId)
    const pts = task?.points || 0
    const bonusSubmissions = (data.bonusSubmissions || []).map(s => s.id === submissionId ? { ...s, status: 'approved', approvedAt: Date.now() } : s)
    const students = (data.students || []).map(st => st.id === submission.studentId ? { ...st, points: (st.points || 0) + pts } : st)
    await updateDoc(ref, { bonusSubmissions, students })
  }

  // Assign homework (one or more quizzes) to the whole class
  async function assignHomework({ classId, quizIds = [], title, dueAt, enunt }){
    if ((!Array.isArray(quizIds) || quizIds.length === 0) && !enunt) return
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const type = (Array.isArray(quizIds) && quizIds.length > 0) ? 'quiz' : 'text'
    const homeworks = [
      ...(data.homeworks || []),
      { id: nanoid(10), title: title || 'Temă', type, enunt: enunt || '', quizIds, dueAt: dueAt || null, assignedAt: Date.now() }
    ]
    await updateDoc(ref, { homeworks })
  }

  // Student marks a homework as done (for text-type assignments)
  async function submitHomework({ classId, homeworkId, studentId, note }){
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const homeworkSubmissions = [
      ...(data.homeworkSubmissions || []),
      { id: nanoid(10), homeworkId, studentId, note: note || '', at: Date.now() }
    ]
    await updateDoc(ref, { homeworkSubmissions })
  }

  // Explicitly award a badge to a student
  async function awardBadge({ classId, studentId, badgeId }){
    if (!badgeId) return
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const students = (data.students || []).map(s => {
      if (s.id !== studentId) return s
      const list = ensureBadgeList(s.badges)
      if (list.includes(badgeId)) return s
      return { ...s, badges: [...list, badgeId] }
    })
    await updateDoc(ref, { students })
  }

  // Forum: post message to class
  async function postForumMessage({ classId, user, text }){
    if (!text || !text.trim()) return
    const ref = doc(db, 'classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data()
    const forum = [ ...(data.forum || []), { id: nanoid(10), userId: user?.uid || user?.id || 'anon', userName: user?.displayName || user?.name || 'Anonim', text: text.trim(), at: Date.now() } ]
    await updateDoc(ref, { forum })
  }

  const value = useMemo(() => ({
    classes,
    invites,
    activities,
    bonusTasks,
    loading,
    addClass,
    addStudentToClass,
    awardPoints,
    assignHomework,
  submitHomework,
    awardBadge,
    createInvite,
    joinClassByToken,
    deleteClass,
    submitQuizResult,
    submitBonus,
    approveBonus,
    postForumMessage,
  }), [classes, invites, activities, bonusTasks, loading])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}


export const useData = () => useContext(DataCtx)