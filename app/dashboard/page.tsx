"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, BookOpen, Flame, Star, Plus, Award, TrendingUp, PlayCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { collection, getDocs, doc, setDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EnrollmentService } from '@/lib/services/enrollment-service'
import { motion } from "framer-motion"
import { ContinueLearningButton } from "@/components/ContinueLearningButton"

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      try {
        setCoursesLoading(true);
        setCoursesError(null);

        // Query the enrollments collection to find documents where the userId matches the current user's ID.
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userId', '==', user.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        if (enrollmentsSnapshot.empty) {
          setEnrolledCourses([]);
          setCoursesLoading(false);
          return;
        }

        // For each enrollment, fetch the corresponding course document.
        const enrolledCoursesPromises = enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const courseId = enrollmentDoc.data().courseId;
          if (!courseId) return null;

          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          if (!courseDoc.exists()) return null;
          
          const courseData = { id: courseDoc.id, ...courseDoc.data() };
          
          // TODO: Replace random progress with actual progress fetching
          return {
            ...courseData,
            progress: {
              overallCompletion: Math.floor(Math.random() * 80) + 10,
              lessonsCompleted: Math.floor(Math.random() * 5) + 1,
              totalLessons: (courseData as any).lessons?.length || 8,
            }
          };
        });

        const coursesWithProgress = (await Promise.all(enrolledCoursesPromises)).filter(course => course !== null);

        setEnrolledCourses(coursesWithProgress as any[]);

      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setCoursesError('Failed to load your courses. Please try again.');
        toast.error('Failed to load your courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    if (user && !loading) {
      fetchCourses()
    }
  }, [user, loading])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const quickSeed = async () => {
    try {
      const sampleCourses = [
        {
          id: 'hindi-fundamentals',
          title: "Hindi Fundamentals",
          description: "Master the basics of Hindi language and culture",
          instructorName: "Dr. Rajesh Kumar",
          price: 299900,
          currency: 'INR',
          status: 'published',
          language: "Hindi",
          level: 'Beginner',
        },
        {
          id: 'urdu-poetry',
          title: "Urdu Poetry & Literature",
          description: "Explore the beauty of Urdu through classical poetry",
          instructorName: "Prof. Fatima Sheikh",
          price: 399900,
          currency: 'INR',
          status: 'published',
          language: "Urdu",
          level: 'Intermediate',
        },
      ]

      for (const course of sampleCourses) {
        await setDoc(doc(db, 'courses', course.id), {
          ...course,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }

      toast.success('Sample courses created!')
      window.location.reload()
    } catch (error) {
      console.error('Error creating courses:', error)
      toast.error('Failed to create courses')
    }
  }

  const autoEnrollInCourses = async () => {
    if (!user) return
    
    try {
      // Auto-enroll in existing courses for testing
      const courseIds = ['hindi-fundamentals', 'urdu-poetry', 'bengali-culture']
      
      for (const courseId of courseIds) {
        try {
          await EnrollmentService.enrollUser(user.uid, courseId)
        } catch (error) {
          console.log(`Could not enroll in ${courseId}:`, error)
        }
      }
      
      toast.success('Auto-enrolled in available courses for testing!')
      window.location.reload()
    } catch (error) {
      console.error('Error auto-enrolling:', error)
      toast.error('Failed to auto-enroll')
    }
  }

  const currentUser = {
    name: userData?.displayName || user?.email?.split('@')[0] || 'Student',
    streak: userData?.streak || 7,
    totalPoints: userData?.totalPoints || 1250,
    level: userData?.learningLevel || "Intermediate",
    completedCourses: 3,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {currentUser.name.split(" ")[0]}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Let's continue your language learning journey.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-primary/80 to-primary">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <CardTitle>Continue Learning</CardTitle>
                        <CardDescription className="text-white/80">You are doing great, keep it up!</CardDescription>
                      </div>
                      <PlayCircle className="w-12 h-12 text-white/50" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {enrolledCourses.length > 0 ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold dark:text-white">{enrolledCourses[0].title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">by {enrolledCourses[0].instructorName}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Progress value={enrolledCourses[0].progress.overallCompletion} className="w-full" />
                            <span className="text-sm font-semibold dark:text-white">{enrolledCourses[0].progress.overallCompletion}%</span>
                          </div>
                        </div>
                        <ContinueLearningButton courseId={enrolledCourses[0].id}>
                          Continue <ChevronRight className="w-4 h-4 ml-2" />
                        </ContinueLearningButton>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="dark:text-gray-400">You are not enrolled in any courses yet.</p>
                        <div className="flex gap-2 justify-center mt-4">
                          <Button asChild>
                            <Link href="/courses">
                              Browse Courses
                            </Link>
                          </Button>
                          <Button variant="outline" onClick={autoEnrollInCourses}>
                            Auto-Enroll (Testing)
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Courses</h2>
                  <Button variant="outline" asChild>
                    <Link href="/courses">
                      View All
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-3xl">{course.language === 'Hindi' ? '🇮🇳' : '📚'}</span>
                            </div>
                            <div className="flex-1">
                              <Badge variant={course.level === 'Beginner' ? 'default' : 'secondary'}>{course.level}</Badge>
                              <h3 className="font-semibold mt-2 dark:text-white">{course.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">by {course.instructorName}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Progress value={course.progress.overallCompletion} className="w-full" />
                                <span className="text-sm font-semibold dark:text-white">{course.progress.overallCompletion}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Flame className="w-6 h-6 text-primary" />
                        <p className="dark:text-gray-400">Learning Streak</p>
                      </div>
                      <p className="font-semibold dark:text-white">{currentUser.streak} days</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <p className="dark:text-gray-400">Total Points</p>
                      </div>
                      <p className="font-semibold dark:text-white">{currentUser.totalPoints}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <p className="dark:text-gray-400">Completed Courses</p>
                      </div>
                      <p className="font-semibold dark:text-white">{currentUser.completedCourses}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                    <div className="grid grid-cols-3 gap-4">
                      <Award className="w-12 h-12 text-yellow-500" />
                      <Award className="w-12 h-12 text-gray-300" />
                      <Award className="w-12 h-12 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}