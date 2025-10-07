import React from 'react'

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-4 border-b border-zinc-200 dark:border-zinc-700 ${className}`}>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{children}</h3>
    </div>
  )
}

export default CardHeader