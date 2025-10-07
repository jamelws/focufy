import React from 'react'

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-zinc-800/50 rounded-xl shadow-md overflow-hidden transition-all duration-300 ${className}`}>
        {children}
    </div>
  )
}

export default Card