"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"

export default function DebugDashboard() {
  const { user, userData, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    console.log('=== DEBUG DASHBOARD ===')
    console.log('Loading:', loading)
    console.log('User:', user)
    console.log('UserData:', userData)
    console.log('Firebase Config Check:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    })

    setDebugInfo({
      loading,
      hasUser: !!user,
      hasUserData: !!userData,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    })
  }, [user, userData, loading])

  // Force render something regardless of auth state
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Debug Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth State Debug</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Loading: <span className={loading ? 'text-orange-600' : 'text-green-600'}>{loading.toString()}</span></div>
            <div>Has User: <span className={user ? 'text-green-600' : 'text-red-600'}>{(!!user).toString()}</span></div>
            <div>Has UserData: <span className={userData ? 'text-green-600' : 'text-red-600'}>{(!!userData).toString()}</span></div>
            <div>User Email: <span className="text-blue-600">{user?.email || 'None'}</span></div>
            <div>User UID: <span className="text-blue-600">{user?.uid || 'None'}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Config Check</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>API Key: <span className={process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'text-green-600' : 'text-red-600'}>
              {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing'}
            </span></div>
            <div>Auth Domain: <span className={process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'text-green-600' : 'text-red-600'}>
              {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing'}
            </span></div>
            <div>Project ID: <span className={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'text-green-600' : 'text-red-600'}>
              {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing'}
            </span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null, userData }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/test-dashboard'}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Test Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}