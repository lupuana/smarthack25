// src/lib/badges.js
// Simple badge catalog and helpers for awarding and rendering

export const BADGES = {
  'quiz-perfect': {
    id: 'quiz-perfect',
    label: 'Quiz Perfect',
    emoji: '🏆',
    color: 'bg-emerald-100 border-emerald-200 text-emerald-700',
    desc: 'Obținut pentru un scor perfect la un quiz.'
  },
  'quiz-5': {
    id: 'quiz-5',
    label: '5 Quiz-uri',
    emoji: '🌟',
    color: 'bg-violet-100 border-violet-200 text-violet-700',
    desc: 'Obținut pentru participarea la 5 quiz-uri.'
  },
  'helper': {
    id: 'helper',
    label: 'Ajutoros',
    emoji: '🤝',
    color: 'bg-sky-100 border-sky-200 text-sky-700',
    desc: 'Obținut pentru sprijinul colegilor.'
  },
  'fast-quiz': {
    id: 'fast-quiz',
    label: 'Rapid',
    emoji: '⚡',
    color: 'bg-yellow-100 border-yellow-200 text-yellow-700',
    desc: 'Finalizare rapidă a unui quiz sub timpul recomandat.'
  },
  'consistency': {
    id: 'consistency',
    label: 'Constanță',
    emoji: '📅',
    color: 'bg-orange-100 border-orange-200 text-orange-700',
    desc: 'Activitate zilnică menținută (ex: quiz/temă 5 zile la rând).'
  },
  'homework-hero': {
    id: 'homework-hero',
    label: 'Teme Finalizate',
    emoji: '📝',
    color: 'bg-indigo-100 border-indigo-200 text-indigo-700',
    desc: 'Finalizarea tuturor temelor active.'
  },
  'early-bird': {
    id: 'early-bird',
    label: 'Devreme',
    emoji: '🌅',
    color: 'bg-rose-100 border-rose-200 text-rose-700',
    desc: 'Trimite o temă cu mult înainte de termen (ex: >24h).'
  },
  'forum-voice': {
    id: 'forum-voice',
    label: 'Voce Activă',
    emoji: '💬',
    color: 'bg-teal-100 border-teal-200 text-teal-700',
    desc: 'Participare constantă în forum (ex: 10 mesaje utile).'
  },
  'perfect-streak': {
    id: 'perfect-streak',
    label: 'Serie Perfectă',
    emoji: '🔥',
    color: 'bg-red-100 border-red-200 text-red-700',
    desc: '3 quiz-uri consecutive cu scor maxim.'
  }
}

export function badgeFromQuiz(score, total) {
  if (typeof score === 'number' && typeof total === 'number' && total > 0) {
    if (score >= total) return 'quiz-perfect'
  }
  return null
}

export function ensureBadgeList(badges) {
  return Array.isArray(badges) ? badges : []
}

export default BADGES;
