import { useEffect, useMemo, useRef } from 'react'

// Animated, colorful bubbles background using existing CSS classes from styles/index.css
export default function Bubbles({ count = 12 }) {
  const containerRef = useRef(null)

  // Precompute bubble specs so they stay stable across renders
  const bubbles = useMemo(() => {
    const sizes = ['bubble-xsmall', 'bubble-small', 'bubble-medium', 'bubble-large']
    const grads = ['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']
    const motions = ['anim-up','anim-down','anim-left','anim-right','anim-d1','anim-d2']
    return Array.from({ length: count }, (_, i) => {
      const size = sizes[Math.floor(Math.random() * sizes.length)]
      const grad = grads[Math.floor(Math.random() * grads.length)]
      const motion = motions[Math.floor(Math.random() * motions.length)]
      // spawn anywhere on screen
      const left = Math.random() * 100
      const top = Math.random() * 100
      const delay = Math.random() * 5 // shorter initial delay
      const durationBase = size === 'bubble-large' ? 14 : size === 'bubble-medium' ? 11 : size === 'bubble-small' ? 9 : 7
      const duration = durationBase - Math.random()*2 // slight variance
      const opacity = 0.15 + Math.random() * 0.28 // more subtle overall
      const blur = 2 + Math.floor(Math.random() * 3) // 2..4px slightly softer
      return { id: i, size, grad, motion, left, top, delay, duration, opacity, blur }
    })
  }, [count])

  // Respect reduced motion preference by hiding bubbles
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mq.matches) return
    if (containerRef.current) containerRef.current.style.display = 'none'
    return () => {
      if (containerRef.current) containerRef.current.style.display = ''
    }
  }, [])

  return (
    <div ref={containerRef} className="bubble-bg">
      {bubbles.map(b => (
        <div
          key={b.id}
          className={`bubble ${b.size} ${b.grad} ${b.motion}`}
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            opacity: b.opacity,
            filter: `blur(${b.blur}px)`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`
          }}
        />
      ))}
    </div>
  )
}
