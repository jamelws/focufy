import Navbar from '@/components/Navbar';
import React from 'react'

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
    <Navbar linksvisibles={false}/>
    <div className='grid place-items-center min-h-screen'>
        {children}   
    </div>
    </>
  )
}

export default AuthLayout