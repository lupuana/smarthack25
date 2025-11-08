import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import Button from '@/components/Button'

// Public page (student port) to accept class invites
export default function JoinClass(){
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { joinClassByToken } = useData()
  const [status, setStatus] = useState('pending') // pending | ok | error | auth
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Token lipsă.'); return }
    if (!user) { setStatus('auth'); return }
    let cancelled = false
    async function run(){
      try {
        const res = await joinClassByToken(token, { id: user.uid, name: user.name })
        if (cancelled) return
        if (res.ok){
          setStatus('ok')
          setMessage('Ai fost înscris în clasă!')
          setTimeout(()=> navigate(`/classes/${res.classId}`), 1200)
        } else {
          setStatus('error')
          setMessage(res.error || 'Token invalid.')
        }
      } catch(e){
        if (cancelled) return
        setStatus('error'); setMessage('Eroare la înscriere.')
      }
    }
    run()
    return () => { cancelled = true }
  }, [token, user, joinClassByToken, navigate])

  if (status === 'auth') {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
        <div className='text-2xl font-bold mb-2'>Conectează-te</div>
        <div className='text-sm text-neutral-600 mb-4'>Ai nevoie de un cont pentru a intra în clasă.</div>
        <Button as='a' href='/login'>Login →</Button>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
      <div className='mb-6'>
        <div className='text-3xl font-extrabold gradient-text mb-2'>Alătură-te Clasei</div>
        <div className='text-sm text-neutral-600'>Verific token-ul de invitație...</div>
      </div>
      {status === 'pending' && <div className='text-sm animate-pulse'>Se procesează...</div>}
      {status === 'ok' && <div className='text-emerald-600 font-medium'>{message}</div>}
      {status === 'error' && <div className='text-rose-600 font-medium'>{message}</div>}
    </div>
  )
}
