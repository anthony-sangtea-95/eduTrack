import React, { useEffect } from 'react'

export default function Timer({ timeLeft, onExpire }){
  // show mm:ss
  const mm = Math.floor((timeLeft||0)/60)
  const ss = (timeLeft||0)%60
  const isWarning = timeLeft <= 60

  useEffect(()=>{
    if (timeLeft === 0 && onExpire) onExpire()
  }, [timeLeft, onExpire])

  return (
    <div className={`student-timer ${isWarning ? 'warning' : ''}`} role="timer" aria-live="off" aria-label={`Time remaining ${mm} minutes ${ss} seconds`}>
      <span className="student-timer-label">Time remaining</span>
      <strong>{String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}</strong>
      {isWarning && <span className="student-timer-warning">Auto-submit in one minute</span>}
    </div>
  )
}
