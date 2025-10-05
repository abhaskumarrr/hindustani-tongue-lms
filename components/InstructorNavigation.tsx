"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, LogOut, BookOpen, BarChart3, Users } from 'lucide-react'
import { signOutUser } from '@/lib/auth'
import { toast } from 'sonner'

export function InstructorNavigation() {
  const { user, userData } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOutUser()
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const currentUser = {
    name: userData?.displayName || 
          (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}`.trim() : '') ||
          user?.displayName || 
          user?.email?.split('@')[0] || 
          'Instructor',
    email: userData?.email || user?.email || '',
    avatar: userData?.photoURL || user?.photoURL,
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ह</span>
            </div>
            <span className="text-xl font-bold text-foreground">Hindustani Tongue</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/instructor" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/instructor/courses" className="text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-4 h-4 inline mr-1" />
            My Courses
          </Link>
          <Link href="/instructor/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Analytics
          </Link>
          <Link href="/instructor/students" className="text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-4 h-4 inline mr-1" />
            Students
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">Instructor</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Student Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}