import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button';

function NotAutherizedPageSignup() {
  return (
    <>
    <div className="background">
        <div className="flex items-center justify-center h-screen">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-white text-2xl font-bold mb-4">Not Authorized</h1>
            <p className="text-gray-300 mb-6">You are not authorized to access this page. Please sign up or log in.</p>
            <Button className="text-black hover:bg-amber-500 hover:text-white rounded-md bg-white "><Link to="/" >Sign Up</Link></Button>
            </div>
        </div>
        
    </div>
    </>
  )
}

export default NotAutherizedPageSignup;