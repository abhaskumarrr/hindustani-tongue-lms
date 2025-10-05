"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface UseAuthRedirectOptions {
  redirectTo?: string
  redirectIfAuthenticated?: boolean
  redirectIfNotAuthenticated?: boolean
}

export function useAuthRedirect({
  redirectTo = '/dashboard',
  redirectIfAuthenticated = false,
  redirectIfNotAuthenticated = false,
}: UseAuthRedirectOptions = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (redirectIfAuthenticated && user) {
      router.push(redirectTo)
    }

    if (redirectIfNotAuthenticated && !user) {
      router.push('/login')
    }
  }, [user, loading, router, redirectTo, redirectIfAuthenticated, redirectIfNotAuthenticated])

  return { user, loading }
}