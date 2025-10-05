"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutUser } from "@/lib/auth"

export function SiteHeader() {
  const { user, userData } = useAuth()
  const pathname = usePathname()

  const displayName = userData?.displayName || user?.displayName || user?.email?.split("@")[0] || "User"

  const handleSignOut = async () => {
    try {
      await signOutUser()
      window.location.href = "/"
    } catch {}
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
        <nav className="hidden md:flex items-center space-x-3">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
            Courses
          </Link>
          <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
            About
          </Link>
          <Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
            Reviews
          </Link>
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                      <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm">{displayName}</span>
                    <ChevronDown className="hidden lg:inline h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/courses">Browse Courses</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
                Sign In
              </Link>
              <Button asChild>
                <Link href={pathname?.startsWith("/courses/") ? pathname : "/signup"}>Start Learning</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}