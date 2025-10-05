"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Trophy,
  Star,
  Target,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  File as Fire,
  Globe,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AchievementsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all-time")

  const userStats = {
    totalPoints: 2450,
    currentStreak: 12,
    longestStreak: 28,
    totalStudyTime: "47h 32m",
    lessonsCompleted: 89,
    coursesCompleted: 2,
    coursesInProgress: 3,
    level: "Intermediate",
    nextLevelPoints: 550,
    rank: 156,
    totalUsers: 10247,
  }

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "🎯",
      category: "Getting Started",
      points: 50,
      earned: true,
      earnedDate: "2024-01-15",
      rarity: "Common",
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      category: "Consistency",
      points: 100,
      earned: true,
      earnedDate: "2024-01-22",
      rarity: "Common",
    },
    {
      id: 3,
      title: "Culture Explorer",
      description: "Learn 10 cultural facts",
      icon: "🏛️",
      category: "Cultural Learning",
      points: 75,
      earned: true,
      earnedDate: "2024-02-01",
      rarity: "Uncommon",
    },
    {
      id: 4,
      title: "Hindi Hero",
      description: "Complete Hindi Fundamentals course",
      icon: "🇮🇳",
      category: "Course Completion",
      points: 200,
      earned: true,
      earnedDate: "2024-02-15",
      rarity: "Rare",
    },
    {
      id: 5,
      title: "Pronunciation Pro",
      description: "Get perfect pronunciation score 5 times",
      icon: "🎤",
      category: "Skills",
      points: 150,
      earned: false,
      progress: 3,
      total: 5,
      rarity: "Uncommon",
    },
    {
      id: 6,
      title: "Heritage Hero",
      description: "Complete 3 different language courses",
      icon: "👑",
      category: "Mastery",
      points: 300,
      earned: false,
      progress: 2,
      total: 3,
      rarity: "Epic",
    },
    {
      id: 7,
      title: "Community Helper",
      description: "Help 5 fellow learners in discussions",
      icon: "🤝",
      category: "Community",
      points: 125,
      earned: false,
      progress: 2,
      total: 5,
      rarity: "Uncommon",
    },
    {
      id: 8,
      title: "Speed Learner",
      description: "Complete 10 lessons in one day",
      icon: "⚡",
      category: "Achievement",
      points: 175,
      earned: false,
      progress: 0,
      total: 10,
      rarity: "Rare",
    },
    {
      id: 9,
      title: "Polyglot",
      description: "Start learning 4 different languages",
      icon: "🌍",
      category: "Exploration",
      points: 250,
      earned: false,
      progress: 3,
      total: 4,
      rarity: "Epic",
    },
    {
      id: 10,
      title: "Master Scholar",
      description: "Earn 5000 total points",
      icon: "🎓",
      category: "Mastery",
      points: 500,
      earned: false,
      progress: 2450,
      total: 5000,
      rarity: "Legendary",
    },
  ]

  const weeklyProgress = [
    { day: "Mon", lessons: 3, minutes: 45 },
    { day: "Tue", lessons: 2, minutes: 30 },
    { day: "Wed", lessons: 4, minutes: 60 },
    { day: "Thu", lessons: 1, minutes: 15 },
    { day: "Fri", lessons: 3, minutes: 45 },
    { day: "Sat", lessons: 5, minutes: 75 },
    { day: "Sun", lessons: 2, minutes: 30 },
  ]

  const certificates = [
    {
      id: 1,
      title: "Hindi Fundamentals",
      completedDate: "2024-02-15",
      instructor: "Dr. Rajesh Kumar",
      grade: "A+",
      thumbnail: "/certificate-hindi.jpg",
    },
    {
      id: 2,
      title: "Bengali Culture Basics",
      completedDate: "2024-01-28",
      instructor: "Prof. Anita Das",
      grade: "A",
      thumbnail: "/certificate-bengali.jpg",
    },
  ]

  const earnedAchievements = achievements.filter((a) => a.earned)
  const inProgressAchievements = achievements.filter((a) => !a.earned && a.progress !== undefined)
  const lockedAchievements = achievements.filter((a) => !a.earned && a.progress === undefined)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Uncommon":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Epic":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="/achievements" className="text-primary font-medium">
              Achievements
            </Link>
          </nav>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Learning Journey</h1>
          <p className="text-lg text-muted-foreground">Track your progress and celebrate your achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-primary">{userStats.totalPoints.toLocaleString()}</p>
                </div>
                <Star className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-secondary">{userStats.currentStreak} days</p>
                </div>
                <Fire className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold text-foreground">{userStats.totalStudyTime}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lessons Done</p>
                  <p className="text-2xl font-bold text-foreground">{userStats.lessonsCompleted}</p>
                </div>
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-secondary" />
              Level Progress
            </CardTitle>
            <CardDescription>Your journey to the next level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {userStats.level}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Rank #{userStats.rank} of {userStats.totalUsers.toLocaleString()} learners
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next Level</p>
                  <p className="font-semibold">{userStats.nextLevelPoints} points to go</p>
                </div>
              </div>
              <Progress
                value={(userStats.totalPoints / (userStats.totalPoints + userStats.nextLevelPoints)) * 100}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{userStats.totalPoints} points</span>
                <span>{userStats.totalPoints + userStats.nextLevelPoints} points</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earned Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Earned ({earnedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {earnedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm">{achievement.title}</h4>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-primary font-medium">+{achievement.points} points</span>
                            <span className="text-xs text-muted-foreground">{achievement.earnedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* In Progress Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="w-5 h-5 mr-2 text-secondary" />
                    In Progress ({inProgressAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inProgressAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-60">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm">{achievement.title}</h4>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {achievement.progress}/{achievement.total}
                              </span>
                              <span className="text-secondary">+{achievement.points} points</span>
                            </div>
                            <Progress
                              value={((achievement.progress || 0) / (achievement.total || 1)) * 100}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Locked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Globe className="w-5 h-5 mr-2 text-muted-foreground" />
                    Locked ({lockedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-40">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-muted-foreground text-sm">{achievement.title}</h4>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)} opacity-60`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          <span className="text-xs text-muted-foreground">+{achievement.points} points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription>Your learning activity this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 text-sm text-muted-foreground">{day.day}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{day.lessons} lessons</span>
                            <span className="text-sm text-muted-foreground">{day.minutes}min</span>
                          </div>
                          <Progress value={(day.lessons / 5) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Learning Stats
                  </CardTitle>
                  <CardDescription>Your overall learning statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Courses Completed</span>
                    <span className="font-semibold">{userStats.coursesCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Courses In Progress</span>
                    <span className="font-semibold">{userStats.coursesInProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons Completed</span>
                    <span className="font-semibold">{userStats.lessonsCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Longest Streak</span>
                    <span className="font-semibold">{userStats.longestStreak} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Study Time</span>
                    <span className="font-semibold">{userStats.totalStudyTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{certificate.title}</h3>
                          <p className="text-sm text-muted-foreground">Completed on {certificate.completedDate}</p>
                          <p className="text-sm text-muted-foreground">Instructor: {certificate.instructor}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          Grade: {certificate.grade}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {certificates.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No certificates yet</h3>
                  <p className="text-muted-foreground mb-4">Complete a course to earn your first certificate!</p>
                  <Button asChild>
                    <Link href="/courses">
                      Browse Courses
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>Detailed analytics about your learning journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Most Active Days</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                          const activity = weeklyProgress[index]
                          const intensity = activity.lessons / 5
                          return (
                            <div key={day} className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">{day}</div>
                              <div
                                className={`h-8 rounded ${
                                  intensity > 0.8
                                    ? "bg-primary"
                                    : intensity > 0.6
                                      ? "bg-primary/70"
                                      : intensity > 0.4
                                        ? "bg-primary/50"
                                        : intensity > 0.2
                                          ? "bg-primary/30"
                                          : "bg-muted"
                                }`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-3">Learning Patterns</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Average session length</span>
                          <span className="font-medium">23 minutes</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Preferred learning time</span>
                          <span className="font-medium">Evening (7-9 PM)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Completion rate</span>
                          <span className="font-medium">87%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goals</CardTitle>
                  <CardDescription>Your learning objectives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weekly Goal</span>
                      <span className="text-foreground">5/7 days</span>
                    </div>
                    <Progress value={(5 / 7) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Points</span>
                      <span className="text-foreground">1,200/1,500</span>
                    </div>
                    <Progress value={(1200 / 1500) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="text-foreground">2/3 completed</span>
                    </div>
                    <Progress value={(2 / 3) * 100} className="h-2" />
                  </div>

                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Update Goals
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
