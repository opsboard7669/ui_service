import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  resetKey?: string | number
  className?: string
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  suffix = '',
  resetKey = 0,
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    setDisplay(0)
    if (value === 0) return

    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    const frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, resetKey])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}
