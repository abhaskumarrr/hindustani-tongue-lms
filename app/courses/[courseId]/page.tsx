'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseService } from '@/lib/services/course-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContinueLearningButton } from '@/components/ContinueLearningButton';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle, 
  Play,
  Globe,
  Award,
  Heart,
  Share2,
  Lock,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

// Mock course data - same as enrollment page
const getCourseData = (courseId: string) => {
  const courses = {
    'hindi-fundamentals': {
      id: 'hindi-fundamentals',
      title: 'Hindi Fundamentals',
      subtitle: 'Master the basics of Hindi language and culture',
      language: 'Hindi',
      script: 'हिन्दी',
      level: 'Beginner',
      instructor: 'Dr. Rajesh Kumar',
      instructorImage: '/instructor-rajesh.jpg',
      instructorBio: 'Dr. Rajesh Kumar is a renowned linguist with over 15 years of experience teaching Hindi to international students. He holds a PhD in Hindi Literature from Jawaharlal Nehru University and has authored several books on Hindi grammar and culture.',
      rating: 4.9,
      reviewCount: 1247,
      enrollmentCount: 5200,
      duration: '8 weeks',
      lessonsCount: 24,
      price: 2999,
      originalPrice: 4999,
      thumbnail: '/hindi-course-cover.jpg',
      description: 'Learn Hindi from scratch with cultural context and practical conversations. This comprehensive course covers everything from basic Devanagari script to advanced conversation skills.',
      features: [
        'Native pronunciation training',
        'Cultural insights and context',
        'Interactive exercises and quizzes',
        'Certificate of completion',
        'Lifetime access to content',
        'Mobile app access',
        'Community forum access',
        'Progress tracking'
      ],
      curriculum: [
        {
          title: 'Introduction to Devanagari script',
          duration: '45 min',
          lessons: 3
        },
        {
          title: 'Basic greetings and introductions',
          duration: '60 min',
          lessons: 4
        },
        {
          title: 'Numbers and counting systems',
          duration: '30 min',
          lessons: 2
        },
        {
          title: 'Family relationships and terms',
          duration: '50 min',
          lessons: 3
        },
        {
          title: 'Daily routines and activities',
          duration: '70 min',
          lessons: 4
        },
        {
          title: 'Food and dining vocabulary',
          duration: '40 min',
          lessons: 3
        },
        {
          title: 'Shopping and market conversations',
          duration: '55 min',
          lessons: 3
        },
        {
          title: 'Travel and transportation',
          duration: '45 min',
          lessons: 2
        }
      ],
      learningObjectives: [
        'Read and write in Devanagari script',
        'Hold basic conversations in Hindi',
        'Understand cultural context and etiquette',
        'Navigate daily situations in Hindi',
        'Build a vocabulary of 500+ words',
        'Understand Hindi grammar fundamentals'
      ],
      requirements: [
        'No prior knowledge of Hindi required',
        'Access to computer or mobile device',
        'Internet connection for video lessons',
        'Dedication of 3-4 hours per week'
      ],
      reviews: [
        {
          name: 'Sarah Johnson',
          rating: 5,
          comment: 'Excellent course! Dr. Kumar explains everything so clearly and the cultural context makes it so much more interesting.',
          date: '2 weeks ago'
        },
        {
          name: 'Michael Chen',
          rating: 5,
          comment: 'I went from knowing nothing to being able to have basic conversations. The progression is perfect.',
          date: '1 month ago'
        },
        {
          name: 'Priya Patel',
          rating: 4,
          comment: 'Great content and structure. Would love to see more advanced courses from this instructor.',
          date: '3 weeks ago'
        }
      ]
    },
    'urdu-poetry': {
      id: 'urdu-poetry',
      title: 'Urdu Poetry & Literature',
      subtitle: 'Explore the beauty of Urdu through classical poetry',
      language: 'Urdu',
      script: 'اردو',
      level: 'Intermediate',
      instructor: 'Fatima Ali',
      instructorImage: '/instructor-fatima.jpg',
      instructorBio: 'Fatima Ali is a celebrated Urdu poet and literature professor with a Master\'s degree in Urdu Literature from Aligarh Muslim University. She has published three poetry collections and regularly conducts literary workshops.',
      rating: 4.8,
      reviewCount: 892,
      enrollmentCount: 2100,
      duration: '6 weeks',
      lessonsCount: 18,
      price: 3499,
      originalPrice: 5499,
      thumbnail: '/urdu-course-cover.jpg',
      description: 'Dive deep into Urdu literature and understand the soul of the language through classical and modern poetry.',
      features: [
        'Classical poetry analysis',
        'Modern literature exploration',
        'Cultural and historical context',
        'Writing practice sessions',
        'Expert instructor feedback',
        'Literary discussion forums',
        'Certificate of completion',
        'Lifetime access'
      ],
      curriculum: [
        {
          title: 'Introduction to Urdu script and calligraphy',
          duration: '60 min',
          lessons: 3
        },
        {
          title: 'Famous poets: Ghalib, Iqbal, Faiz',
          duration: '90 min',
          lessons: 4
        },
        {
          title: 'Understanding ghazals and nazms',
          duration: '75 min',
          lessons: 3
        },
        {
          title: 'Modern Urdu literature trends',
          duration: '60 min',
          lessons: 3
        },
        {
          title: 'Writing your own poetry',
          duration: '80 min',
          lessons: 3
        },
        {
          title: 'Literary criticism and analysis',
          duration: '70 min',
          lessons: 2
        }
      ],
      learningObjectives: [
        'Appreciate classical Urdu poetry',
        'Understand poetic forms and meters',
        'Write basic Urdu poetry',
        'Analyze literary works critically',
        'Connect with Urdu cultural heritage',
        'Improve Urdu reading and writing skills'
      ],
      requirements: [
        'Basic knowledge of Urdu script',
        'Interest in literature and poetry',
        'Intermediate reading level in Urdu',
        'Commitment to weekly assignments'
      ],
      reviews: [
        {
          name: 'Ahmed Hassan',
          rating: 5,
          comment: 'Fatima Ali brings poetry to life. Her explanations of classical works are phenomenal.',
          date: '1 week ago'
        },
        {
          name: 'Zara Khan',
          rating: 5,
          comment: 'This course deepened my appreciation for Urdu literature. Highly recommended!',
          date: '2 weeks ago'
        }
      ]
    },
    'punjabi-for-beginners': {
      id: 'punjabi-for-beginners',
      title: 'Punjabi for Beginners',
      subtitle: 'Learn the basics of Punjabi language and culture',
      language: 'Punjabi',
      script: 'ਪੰਜਾਬੀ',
      level: 'Beginner',
      instructor: 'Prof. Harpreet Singh',
      instructorImage: '/placeholder.jpg',
      instructorBio: 'Prof. Harpreet Singh is an experienced educator in Punjabi language and literature, with a focus on teaching beginners.',
      rating: 4.7,
      reviewCount: 950,
      enrollmentCount: 3100,
      duration: '7 weeks',
      lessonsCount: 20,
      price: 2799,
      originalPrice: 4599,
      thumbnail: '/placeholder.jpg',
      description: 'An engaging course to introduce you to the Gurmukhi script, basic grammar, and conversational Punjabi, along with cultural insights.',
      features: [
        'Gurmukhi script mastery',
        'Conversational practice',
        'Cultural context',
        'Interactive exercises',
        'Certificate of completion'
      ],
      curriculum: [
        { title: 'Introduction to Gurmukhi Script', duration: '50 min', lessons: 3 },
        { title: 'Basic Greetings and Phrases', duration: '60 min', lessons: 4 },
        { title: 'Numbers and Counting', duration: '30 min', lessons: 2 },
        { title: 'Family and Relationships', duration: '45 min', lessons: 3 }
      ],
      learningObjectives: [
        'Read and write basic Gurmukhi',
        'Engage in simple Punjabi conversations',
        'Understand Punjabi cultural nuances'
      ],
      requirements: [
        'No prior knowledge required',
        'Internet access',
        'Dedication to practice'
      ],
      reviews: [
        { name: 'Jaspreet Kaur', rating: 5, comment: 'Excellent course for learning Punjabi from scratch!', date: '1 month ago' }
      ]
    },
    'telugu-language-essentials': {
      id: 'telugu-language-essentials',
      title: 'Telugu Language Essentials',
      subtitle: 'Start speaking and understanding Telugu with this introductory course',
      language: 'Telugu',
      script: 'తెలుగు',
      level: 'Beginner',
      instructor: 'Dr. Anjali Rao',
      instructorImage: '/placeholder.jpg',
      instructorBio: 'Dr. Anjali Rao holds a PhD in Telugu linguistics and has dedicated her career to making Telugu accessible to new learners.',
      rating: 4.6,
      reviewCount: 780,
      enrollmentCount: 2800,
      duration: '8 weeks',
      lessonsCount: 22,
      price: 2899,
      originalPrice: 4799,
      thumbnail: '/placeholder.jpg',
      description: 'This course provides a solid foundation in Telugu, covering script, basic grammar, and essential vocabulary for everyday use.',
      features: [
        'Telugu script writing',
        'Basic grammar rules',
        'Everyday conversational phrases',
        'Cultural insights',
        'Quizzes and practice exercises'
      ],
      curriculum: [
        { title: 'Introduction to Telugu Script', duration: '55 min', lessons: 3 },
        { title: 'Common Phrases and Greetings', duration: '65 min', lessons: 4 },
        { title: 'Numbers and Time', duration: '35 min', lessons: 2 },
        { title: 'Food and Dining', duration: '50 min', lessons: 3 }
      ],
      learningObjectives: [
        'Read and write basic Telugu',
        'Form simple sentences',
        'Understand common spoken Telugu'
      ],
      requirements: [
        'No prior Telugu knowledge',
        'Internet connection',
        'Willingness to learn'
      ],
      reviews: [
        { name: 'Suresh Kumar', rating: 5, comment: 'Very well structured course for beginners.', date: '3 weeks ago' }
      ]
    },
    'tamil-foundations': {
      id: 'tamil-foundations',
      title: 'Tamil Foundations',
      subtitle: 'Build a strong base in one of the world\'s oldest living languages',
      language: 'Tamil',
      script: 'தமிழ்',
      level: 'Beginner',
      instructor: 'Mr. Karthik Subramanian',
      instructorImage: '/placeholder.jpg',
      instructorBio: 'Mr. Karthik Subramanian is a native Tamil speaker and a passionate teacher with years of experience in language instruction.',
      rating: 4.9,
      reviewCount: 1100,
      enrollmentCount: 4500,
      duration: '9 weeks',
      lessonsCount: 25,
      price: 3199,
      originalPrice: 5199,
      thumbnail: '/placeholder.jpg',
      description: 'Explore the rich heritage of Tamil language. This course covers script, grammar, and conversational skills.',
      features: [
        'Ancient script learning',
        'Grammar fundamentals',
        'Daily conversation practice',
        'Cultural insights',
        'Interactive quizzes'
      ],
      curriculum: [
        { title: 'Introduction to Tamil Script', duration: '60 min', lessons: 4 },
        { title: 'Basic Tamil Grammar', duration: '70 min', lessons: 4 },
        { title: 'Greetings and Introductions', duration: '40 min', lessons: 3 },
        { title: 'Travel Phrases', duration: '55 min', lessons: 3 }
      ],
      learningObjectives: [
        'Read and write Tamil script',
        'Understand basic Tamil grammar',
        'Speak simple Tamil sentences'
      ],
      requirements: [
        'No prior Tamil experience',
        'Access to course materials',
        'Regular practice'
      ],
      reviews: [
        { name: 'Priya Sharma', rating: 5, comment: 'Fantastic course! The instructor is very clear and helpful.', date: '2 weeks ago' }
      ]
    },
    'gujarati-basic-conversations': {
      id: 'gujarati-basic-conversations',
      title: 'Gujarati Basic Conversations',
      subtitle: 'Learn to converse in Gujarati for travel and daily interactions',
      language: 'Gujarati',
      script: 'ગુજરાતી',
      level: 'Beginner',
      instructor: 'Ms. Pooja Sharma',
      instructorImage: '/placeholder.jpg',
      instructorBio: 'Ms. Pooja Sharma specializes in teaching conversational Gujarati, helping students quickly gain practical speaking skills.',
      rating: 4.5,
      reviewCount: 620,
      enrollmentCount: 1900,
      duration: '6 weeks',
      lessonsCount: 16,
      price: 2599,
      originalPrice: 4299,
      thumbnail: '/placeholder.jpg',
      description: 'A practical course focused on enabling you to speak and understand Gujarati in common situations.',
      features: [
        'Conversational Gujarati',
        'Essential vocabulary',
        'Pronunciation guide',
        'Role-playing exercises',
        'Travel phrases'
      ],
      curriculum: [
        { title: 'Introduction to Gujarati Sounds', duration: '40 min', lessons: 2 },
        { title: 'Meeting and Greeting', duration: '50 min', lessons: 3 },
        { title: 'Shopping and Bargaining', duration: '45 min', lessons: 3 },
        { title: 'Asking for Directions', duration: '35 min', lessons: 2 }
      ],
      learningObjectives: [
        'Speak basic Gujarati phrases',
        'Understand simple questions',
        'Navigate daily interactions in Gujarati'
      ],
      requirements: [
        'No prior Gujarati knowledge',
        'Enthusiasm to learn',
        'Microphone for practice'
      ],
      reviews: [
        { name: 'Rahul Mehta', rating: 4, comment: 'Good course for quick conversational skills.', date: '1 month ago' }
      ]
    },
    'marathi-introductory': {
      id: 'marathi-introductory',
      title: 'Marathi Introductory Course',
      subtitle: 'An easy introduction to the Marathi language and Maharashtrian culture',
      language: 'Marathi',
      script: 'मराठी',
      level: 'Beginner',
      instructor: 'Dr. Vikram Joshi',
      instructorImage: '/placeholder.jpg',
      instructorBio: 'Dr. Vikram Joshi is a cultural expert and Marathi language instructor, known for his engaging teaching style.',
      rating: 4.8,
      reviewCount: 850,
      enrollmentCount: 2900,
      duration: '7 weeks',
      lessonsCount: 19,
      price: 2699,
      originalPrice: 4499,
      thumbnail: '/placeholder.jpg',
      description: 'Learn the fundamentals of Marathi, including basic script, common phrases, and an introduction to Maharashtrian traditions.',
      features: [
        'Devanagari script for Marathi',
        'Basic grammar and vocabulary',
        'Cultural insights',
        'Interactive audio lessons',
        'Practice dialogues'
      ],
      curriculum: [
        { title: 'Introduction to Marathi Script', duration: '45 min', lessons: 3 },
        { title: 'Everyday Marathi Phrases', duration: '55 min', lessons: 4 },
        { title: 'Numbers and Colors', duration: '30 min', lessons: 2 },
        { title: 'Maharashtrian Culture Spotlight', duration: '40 min', lessons: 2 }
      ],
      learningObjectives: [
        'Read and write basic Marathi',
        'Understand and use common phrases',
        'Appreciate Maharashtrian culture'
      ],
      requirements: [
        'No prior Marathi knowledge',
        'Interest in Indian languages',
        'Regular study time'
      ],
      reviews: [
        { name: 'Ananya Deshmukh', rating: 5, comment: 'Dr. Joshi makes learning Marathi fun and easy!', date: '2 weeks ago' }
      ]
    }
  };

  return courses[courseId as keyof typeof courses] || null;
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [accessStatus, setAccessStatus] = useState<any>(null);

  const courseId = params.courseId as string;

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        
        // Prioritize mock data for now, fallback to service
        let courseData = getCourseData(courseId);
        
        // If mock data doesn't exist, try service
        if (!courseData) {
          try {
            const serviceCourse = await CourseService.getCourse(courseId);
            if (serviceCourse) {
              courseData = serviceCourse as any; // Type assertion for compatibility
            }
          } catch (error) {
            console.log('CourseService unavailable, course not found in mock data');
          }
        }
        
        if (!courseData) {
          console.error('Course not found:', courseId);
          router.push('/courses');
          return;
        }

        setCourse(courseData);

        // Check enrollment status if user is logged in (skip if service unavailable)
        if (user) {
          setEnrollmentLoading(true);
          try {
            const enrolled = await CourseService.isUserEnrolled(user.uid, courseId);
            setIsEnrolled(enrolled);
            
            if (enrolled) {
              const access = await CourseService.verifyCourseAccess(user.uid, courseId);
              setAccessStatus(access);
            }
          } catch (error) {
            console.log('Enrollment check unavailable, showing enrollment option');
            // Don't block the UI if the service is unavailable
            setIsEnrolled(false);
          } finally {
            setEnrollmentLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
        router.push('/courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4 mb-6">
                  <img
                    src={course.thumbnail || '/placeholder.svg'}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-3xl font-semibold">{course.script}</span>
                      <Badge variant="outline">{course.language}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{course.subtitle}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-medium text-foreground">{course.rating}</span>
                        <span className="ml-1">({course.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.enrollmentCount.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Save for Later
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Course
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{course.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">What You'll Learn</h4>
                        <div className="space-y-2">
                          {course.learningObjectives.map((item: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Course Features</h4>
                        <div className="space-y-2">
                          {course.features && course.features.slice(0, 6).map((feature: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements && course.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      {course.lessonsCount} lessons • {course.duration} total duration
                      {!isEnrolled && user && (
                        <span className="ml-2 text-primary">• Preview available for first lesson</span>
                      )}
                      {!user && (
                        <span className="ml-2 text-primary">• Sign in to preview lessons</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Enrollment status alert */}
                    {!isEnrolled && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {!user ? (
                            <>
                              <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign in
                              </Link>
                              {' '}to preview lessons and track your progress, or{' '}
                              <Link href={`/courses/${course.id}/enroll`} className="font-medium text-primary hover:underline">
                                enroll now
                              </Link>
                              {' '}for full access to all {course.lessonsCount} lessons.
                            </>
                          ) : (
                            <>
                              You can preview the first lesson for free.{' '}
                              <Link href={`/courses/${course.id}/enroll`} className="font-medium text-primary hover:underline">
                                Enroll now
                              </Link>
                              {' '}to unlock all {course.lessonsCount} lessons and get lifetime access.
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {course.curriculum && course.curriculum.map((module: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{module.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{module.lessons} lessons</span>
                              <span>{module.duration}</span>
                              {/* Enhanced status badges */}
                              {isEnrolled ? (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Unlocked
                                </Badge>
                              ) : index === 0 ? (
                                <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Requires Enrollment
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Play className="w-3 h-3" />
                              <span>Video content with interactive exercises</span>
                            </div>
                            {/* Enhanced action buttons */}
                            <div className="flex gap-2">
                              {isEnrolled ? (
                                <Button size="sm" variant="default" asChild>
                                  <Link href={`/learn/${course.id}`}>
                                    <Play className="w-3 h-3 mr-1" />
                                    Start Learning
                                  </Link>
                                </Button>
                              ) : index === 0 && user ? (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/learn/${course.id}?preview=true`}>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview Free
                                  </Link>
                                </Button>
                              ) : index === 0 && !user ? (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href="/login">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Sign in to Preview
                                  </Link>
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" disabled>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Locked
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Enhanced call-to-action for non-enrolled users */}
                    {!isEnrolled && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="text-center">
                          <h4 className="font-semibold mb-2 text-lg">Ready to Start Learning?</h4>
                          <p className="text-muted-foreground mb-4">
                            Get full access to all {course.lessonsCount} lessons, lifetime access, and completion certificate
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" asChild>
                              <Link href={`/courses/${course.id}/enroll`}>
                                <Award className="w-4 h-4 mr-2" />
                                Enroll Now - ₹{course.price.toLocaleString('en-IN')}
                              </Link>
                            </Button>
                            {user && (
                              <Button size="lg" variant="outline" asChild>
                                <Link href={`/learn/${course.id}?preview=true`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Try Free Preview
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>Meet Your Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={course.instructorImage || '/placeholder.svg'}
                        alt={course.instructor}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h4 className="text-lg font-semibold">{course.instructor}</h4>
                        <p className="text-muted-foreground">Expert {course.language} Instructor</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>{course.rating} rating</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{course.enrollmentCount.toLocaleString()} students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{course.instructorBio}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      {course.reviewCount} reviews • {course.rating} average rating
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {course.reviews?.map((review: any, index: number) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {review.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.name}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-primary">
                      ₹{course.price.toLocaleString('en-IN')}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        ₹{course.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time payment • Lifetime access
                  </p>
                </div>

                {/* Enhanced Enrollment Status and Actions */}
                <div className="space-y-3 mb-6">
                  {!user ? (
                    <>
                      <Button className="w-full" size="lg" asChild>
                        <Link href="/login">
                          Sign In to Enroll
                        </Link>
                      </Button>
                      {/* Enhanced preview for non-authenticated users */}
                      {course.curriculum && course.curriculum.length > 0 && (
                        <Button variant="outline" className="w-full" size="lg" asChild>
                          <Link href={`/learn/${course.id}?preview=true`}>
                            <Play className="w-4 h-4 mr-2" />
                            Preview Course (Free)
                          </Link>
                        </Button>
                      )}
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview Available • No Account Required
                        </Badge>
                      </div>
                    </>
                  ) : enrollmentLoading ? (
                    <Button className="w-full" size="lg" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking enrollment...
                    </Button>
                  ) : isEnrolled ? (
                    <>
                      {accessStatus?.hasAccess ? (
                        <div className="space-y-2">
                          <ContinueLearningButton courseId={course.id} className="w-full" size="lg">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </ContinueLearningButton>
                          <div className="text-center">
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enrolled & Active
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button className="w-full" size="lg" disabled>
                            <Lock className="w-4 h-4 mr-2" />
                            Access Restricted
                          </Button>
                          {accessStatus?.reason && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {accessStatus.reason === 'payment_pending' && 'Payment verification pending. Please contact support if this persists.'}
                                {accessStatus.reason === 'suspended' && 'Your account has been suspended. Please contact support.'}
                                {accessStatus.reason === 'expired' && 'Your access has expired. Please renew your enrollment.'}
                                {accessStatus.reason === 'not_enrolled' && 'Enrollment not found. Please re-enroll in the course.'}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                      <Button variant="outline" className="w-full" size="lg" asChild>
                        <Link href={`/dashboard`}>
                          View Dashboard
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/courses/${course.id}/enroll`}>
                          <Award className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Link>
                      </Button>
                      {/* Enhanced preview for authenticated non-enrolled users */}
                      {course.curriculum && course.curriculum.length > 0 && (
                        <Button variant="outline" className="w-full" size="lg" asChild>
                          <Link href={`/learn/${course.id}?preview=true`}>
                            <Play className="w-4 h-4 mr-2" />
                            Preview Course (Free)
                          </Link>
                        </Button>
                      )}
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview Available • Enroll for Full Access
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span>{course.lessonsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span>Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}