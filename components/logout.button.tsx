"use client";
import React from 'react'
import { Button } from './ui/button'
import { signOut } from 'next-auth/react'

const LogoutButton = () => {
    const handleLogout = async () => {
       await signOut( { 
        redirect:true, 
        callbackUrl: '/' } 
    );
        console.log('User logged out');
    }
  return (
    <Button onClick={handleLogout}>Logout</Button>
  )
}

export default LogoutButton