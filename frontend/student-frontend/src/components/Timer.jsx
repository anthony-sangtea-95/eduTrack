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
    <div className={`flex items-center gap-3 font-semibold ${isWarning? 'text-red-500 animate-pulse':''}`}>
      <div className="bg-white/5 px-3 py-1 rounded-md shadow-sm">
        {String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}
      </div>
      {isWarning && <div className="text-sm text-red-400">⚠ Test will auto-submit in 1 minute</div>}
    </div>
  )
}
