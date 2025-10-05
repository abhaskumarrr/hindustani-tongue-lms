"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, User, Heart, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    preferredLanguage: "",
    learningLevel: "",
    consent: false,
  })

  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard")
    return null
  }

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error("Please fill in all fields")
        return
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }
    }
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSignUp = async () => {
    if (!formData.preferredLanguage || !formData.learningLevel) {
      toast.error("Please select your language and level preferences")
      return
    }
    if (!formData.consent) {
      toast.error("Please agree to the Terms and Privacy Policy")
      return
    }

    setLoading(true)
    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        {
          preferredLanguage: formData.preferredLanguage,
          learningLevel: formData.learningLevel,
          consentAcceptedAt: new Date().toISOString(),
        }
      )
      toast.success("Account created successfully!")
      setStep(3)
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google signup error:", error)
      toast.error(error.message || "Failed to sign up with Google")
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">ह</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Hindustani Tongue</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Start Your Journey</h1>
          <p className="text-muted-foreground">Join thousands learning their heritage languages</p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl">Create Account</CardTitle>
              <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
            <CardDescription className="text-center mt-4">
              {step === 1 && "Let's start with your basic information"}
              {step === 2 && "Choose your learning preferences"}
              {step === 3 && "You're all set! Welcome to the family"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                {/* Social Login */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent" 
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or create with email</span>
                  </div>
                </div>

                {/* Basic Info Form */}
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="Priya"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Sharma"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="priya@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      id="consent"
                      type="checkbox"
                      className="mt-1 rounded border-border text-primary focus:ring-primary"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      required
                    />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground">
                      I agree to the
                      {' '}<Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </Label>
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Which language interests you most?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Hindi", script: "हिन्दी" },
                      { name: "Urdu", script: "اردو" },
                      { name: "Bengali", script: "বাংলা" },
                      { name: "Punjabi", script: "ਪੰਜਾਬੀ" },
                      { name: "Tamil", script: "தமிழ்" },
                      { name: "Telugu", script: "తెలుగు" },
                    ].map((lang) => (
                      <Button
                        key={lang.name}
                        variant={formData.preferredLanguage === lang.name ? "default" : "outline"}
                        className="h-16 flex-col bg-transparent hover:bg-primary/5 hover:border-primary"
                        onClick={() => setFormData({ ...formData, preferredLanguage: lang.name })}
                      >
                        <span className="text-lg mb-1">{lang.script}</span>
                        <span className="text-xs">{lang.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">What's your current level?</h3>
                  <div className="space-y-2">
                    {[
                      { level: "Complete Beginner", desc: "I'm starting from scratch" },
                      { level: "Some Knowledge", desc: "I know a few words and phrases" },
                      { level: "Intermediate", desc: "I can have basic conversations" },
                      { level: "Advanced", desc: "I want to perfect my skills" },
                    ].map((option) => (
                      <Button
                        key={option.level}
                        variant={formData.learningLevel === option.level ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto p-4 bg-transparent hover:bg-primary/5 hover:border-primary"
                        onClick={() => setFormData({ ...formData, learningLevel: option.level })}
                      >
                        <div>
                          <div className="font-medium">{option.level}</div>
                          <div className="text-sm text-muted-foreground">{option.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Back
                  </Button>
                  <Button onClick={handleSignUp} className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to the Family!</h3>
                  <p className="text-muted-foreground">
                    You're now part of a community of heritage learners reconnecting with their roots.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-foreground mb-2">What's next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete your first lesson</li>
                    <li>• Set up your learning schedule</li>
                    <li>• Join our community forum</li>
                    <li>• Explore cultural content</li>
                  </ul>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cultural Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Join 10,000+ learners reconnecting with their heritage</p>
        </div>
      </div>
    </div>
  )
}
