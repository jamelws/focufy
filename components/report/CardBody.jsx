import React from 'react'

const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
        {children}
    </div>
  )
}

export default CardBody