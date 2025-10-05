"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  ChevronRight,
  CheckCircle,
  Loader2,
  Lock,
  Eye,
  ShoppingCart,
  Award,
  TrendingUp,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { CourseService } from "@/lib/services/course-service"
import { Course } from "@/lib/services/course-service"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { ContinueLearningButton } from "@/components/ContinueLearningButton"
import VimeoPlayer from "@/components/VimeoPlayer"

export default function CoursesPage() {
  const { user, userData } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedInstructor, setSelectedInstructor] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, boolean>>({})
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({})
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching courses from Firestore...')
        
        const { courses: fetchedCourses } = await CourseService.getCourses()
        console.log('Fetched courses:', fetchedCourses)
        
        setCourses(fetchedCourses)

        // Fetch enrollment statuses and progress for authenticated users
        if (user && fetchedCourses.length > 0) {
          const statuses: Record<string, boolean> = {}
          const progress: Record<string, number> = {}
          
          await Promise.all(
            fetchedCourses.map(async (course) => {
              try {
                const isEnrolled = await CourseService.isUserEnrolled(user.uid, course.id)
                statuses[course.id] = isEnrolled
                
                // If enrolled, get progress
                if (isEnrolled) {
                  try {
                    const courseProgress = await CourseService.calculateCourseProgress(user.uid, course.id)
                    progress[course.id] = courseProgress.overallCompletion
                  } catch (error) {
                    console.error(`Error fetching progress for course ${course.id}:`, error)
                    progress[course.id] = 0
                  }
                }
              } catch (error) {
                console.error(`Error checking enrollment for course ${course.id}:`, error)
                statuses[course.id] = false
              }
            })
          )
          
          setEnrollmentStatuses(statuses)
          setCourseProgress(progress)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        setError('Failed to load courses. Please try again.')
        toast.error('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  // Check if user is enrolled in a course
  const isUserEnrolled = (courseId: string) => {
    // Use the fetched enrollment statuses first, fallback to userData
    if (enrollmentStatuses.hasOwnProperty(courseId)) {
      return enrollmentStatuses[courseId]
    }
    if (!userData?.enrolledCourses) return false
    return userData.enrolledCourses.includes(courseId)
  }

  // Get enrollment status with more details
  const getEnrollmentStatus = (courseId: string) => {
    const isEnrolled = isUserEnrolled(courseId)
    return {
      isEnrolled,
      canPreview: !isEnrolled, // Non-enrolled users can preview
      showEnrollButton: !isEnrolled,
      showContinueButton: isEnrolled
    }
  }

  // Handle course preview
  const handlePreviewCourse = (course: Course) => {
    setPreviewCourse(course)
  }

  // Toggle favorite
  const toggleFavorite = (courseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(courseId)) {
        newFavorites.delete(courseId)
        toast.success('Removed from favorites')
      } else {
        newFavorites.add(courseId)
        toast.success('Added to favorites')
      }
      return newFavorites
    })
  }

  // Get preview lessons (first lesson or lessons marked as preview)
  const getPreviewLessons = (course: Course) => {
    const previewLessons = course.lessons?.filter(lesson => lesson.isPreview) || []
    if (previewLessons.length > 0) {
      return previewLessons
    }
    // If no preview lessons, return first lesson as preview
    return course.lessons?.slice(0, 1) || []
  }

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === "all" || course.language === selectedLanguage
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesInstructor = selectedInstructor === "all" || course.instructorName === selectedInstructor

    return matchesSearch && matchesLanguage && matchesLevel && matchesInstructor
  })

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.enrollmentCount - a.enrollmentCount
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      default:
        return 0
    }
  })

  // Get unique values for filters
  const languages = [...new Set(courses.map(c => c.language))]
  const levels = [...new Set(courses.map(c => c.level))]
  const instructors = [...new Set(courses.map(c => c.instructorName))]

  // Format price from paise to rupees
  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toLocaleString()}`
  }

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">
              Learn Indian Languages
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover authentic courses in Hindi, Urdu, Bengali, and more. 
              Learn from native speakers and cultural experts.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {instructors.map(instructor => (
                  <SelectItem key={instructor} value={instructor}>{instructor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Courses Display */}
        {sortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("")
                setSelectedLanguage("all")
                setSelectedLevel("all")
                setSelectedInstructor("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
          }>
            {sortedCourses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(course.id)
              const previewLessons = getPreviewLessons(course)
              const isFavorite = favorites.has(course.id)
              
              return (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder-course.jpg"
                          }}
                        />
                        
                        {/* Top badges and actions */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                            {course.level}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                            {course.language}
                          </Badge>
                        </div>
                        
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                            onClick={() => toggleFavorite(course.id)}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          </Button>
                        </div>
                        
                        {/* Status badge */}
                        <div className="absolute bottom-3 left-3">
                          {enrollmentStatus.isEnrolled ? (
                            <Badge variant="default" className="bg-green-600 text-white shadow-md">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-blue-600 text-white shadow-md">
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              {formatPrice(course.price)}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Preview indicator */}
                        {!enrollmentStatus.isEnrolled && previewLessons.length > 0 && (
                          <div className="absolute bottom-3 right-3">
                            <Badge variant="secondary" className="bg-purple-600 text-white shadow-md">
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Badge>
                          </div>
                        )}
                        
                        {/* Trending indicator for popular courses */}
                        {course.enrollmentCount > 1000 && (
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                            <Badge variant="secondary" className="bg-orange-600 text-white shadow-md">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        {/* Course header */}
                        <div className="mb-3">
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {course.description}
                          </CardDescription>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            <span className="text-xs font-semibold text-primary">
                              {course.instructorName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">{course.instructorName}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{course.enrollmentCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDuration(course.totalDuration)}</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <span>{course.lessons?.length || 0}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(course.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">({course.reviewCount})</span>
                        </div>

                        {/* Progress bar for enrolled users */}
                        {enrollmentStatus.isEnrolled && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-muted-foreground">{courseProgress[course.id] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${courseProgress[course.id] || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2">
                          {enrollmentStatus.showContinueButton ? (
                            <>
                              <ContinueLearningButton courseId={course.id} className="w-full" size="lg">
                                <Play className="w-4 h-4 mr-2" />
                                Continue Learning
                              </ContinueLearningButton>
                              <Button variant="outline" asChild className="w-full">
                                <Link href={`/courses/${course.id}`}>
                                  View Details
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button asChild className="w-full" size="lg">
                                <Link href={`/courses/${course.id}/enroll`}>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Enroll Now - {formatPrice(course.price)}
                                </Link>
                              </Button>
                              <div className="flex gap-2">
                                <Button variant="outline" asChild className="flex-1">
                                  <Link href={`/courses/${course.id}`}>
                                    Details
                                  </Link>
                                </Button>
                                {previewLessons.length > 0 && (
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handlePreviewCourse(course)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    // List View
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Course Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-48 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder-course.jpg"
                            }}
                          />
                          
                          {/* Status overlay */}
                          <div className="absolute top-2 left-2">
                            {enrollmentStatus.isEnrolled ? (
                              <Badge variant="default" className="bg-green-600 text-white text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enrolled
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                                {formatPrice(course.price)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-1">
                                {course.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                {course.description}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline">{course.language}</Badge>
                                <Badge variant="outline">{course.level}</Badge>
                                {course.enrollmentCount > 1000 && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Hot
                                  </Badge>
                                )}
                                {previewLessons.length > 0 && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Instructor and stats */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span>By {course.instructorName}</span>
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  <span>{course.enrollmentCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{formatDuration(course.totalDuration)}</span>
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-1" />
                                  <span>{course.lessons?.length || 0}</span>
                                </div>
                              </div>
                              
                              {/* Rating */}
                              <div className="flex items-center mb-4">
                                <div className="flex items-center mr-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(course.rating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">{course.rating}</span>
                                <span className="text-sm text-muted-foreground ml-1">({course.reviewCount})</span>
                              </div>
                              
                              {/* Progress for enrolled users */}
                              {enrollmentStatus.isEnrolled && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="text-muted-foreground">{courseProgress[course.id] || 0}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${courseProgress[course.id] || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Action buttons and favorites */}
                            <div className="flex items-start gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => toggleFavorite(course.id)}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-3">
                            {enrollmentStatus.showContinueButton ? (
                              <>
                                <ContinueLearningButton courseId={course.id}>
                                  <Play className="w-4 h-4 mr-2" />
                                  Continue Learning
                                </ContinueLearningButton>
                                <Button variant="outline" asChild>
                                  <Link href={`/courses/${course.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button asChild>
                                  <Link href={`/courses/${course.id}/enroll`}>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Enroll - {formatPrice(course.price)}
                                  </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                  <Link href={`/courses/${course.id}`}>
                                    Details
                                  </Link>
                                </Button>
                                {previewLessons.length > 0 && (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handlePreviewCourse(course)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Course Preview Modal */}
        <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Course Preview: {previewCourse?.title}
              </DialogTitle>
              <DialogDescription>
                Get a taste of what you'll learn in this course
              </DialogDescription>
            </DialogHeader>
            
            {previewCourse && (
              <div className="space-y-6">
                {/* Course overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={previewCourse.thumbnail}
                      alt={previewCourse.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder-course.jpg"
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{previewCourse.language}</Badge>
                      <Badge variant="outline">{previewCourse.level}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{previewCourse.title}</h3>
                    <p className="text-muted-foreground mb-4">{previewCourse.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{previewCourse.enrollmentCount.toLocaleString()} students enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(previewCourse.totalDuration)} total duration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{previewCourse.lessons?.length || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{previewCourse.rating} ({previewCourse.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview lessons */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Preview Lessons</h4>
                  <div className="space-y-3">
                    {getPreviewLessons(previewCourse).map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{lesson.title}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {formatDuration(lesson.duration)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/learn/${previewCourse.id}/${lesson.id}?preview=true`}>
                              <Play className="w-3 h-3 mr-1" />
                              Watch Preview
                            </Link>
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Free preview • No enrollment required
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced call to action */}
                <div className="border-t pt-6">
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
                    <div className="text-center">
                      <h4 className="text-xl font-semibold mb-2">Ready to Start Your Learning Journey?</h4>
                      <p className="text-muted-foreground mb-4">
                        Join {previewCourse.enrollmentCount.toLocaleString()} students and get full access to all {previewCourse.lessons?.length || 0} lessons
                      </p>
                      
                      {/* Course benefits */}
                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Lifetime Access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Mobile & Desktop</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Progress Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Certificate</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" asChild>
                          <Link href={`/courses/${previewCourse.id}/enroll`}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Enroll Now - {formatPrice(previewCourse.price)}
                          </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href={`/courses/${previewCourse.id}`}>
                            View Full Details
                          </Link>
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        30-day money-back guarantee • Secure payment via Razorpay
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}