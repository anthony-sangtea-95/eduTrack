import React from 'react'

export default function ProgressCircle({ size=120, percent=0 }){
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent/100)*c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="grad" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size/2},${size/2})`}>
        <circle r={r} stroke="#e6e6e6" strokeWidth="8" fill="none" />
        <circle r={r} stroke="url(#grad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90)" />
        <text x="0" y="6" textAnchor="middle" fontSize="20" fontWeight="600">{percent}%</text>
      </g>
    </svg>
  )
}
