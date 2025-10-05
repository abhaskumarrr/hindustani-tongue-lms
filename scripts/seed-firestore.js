#!/usr/bin/env node

/**
 * Firestore Database Seeding Script
 * 
 * This script populates your Firestore database with sample courses, lessons, and user data
 * to make the LMS fully functional for testing and development.
 * 
 * Usage: node scripts/seed-firestore.js
 */

require('dotenv').config({ path: '.env.local' })

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

// Initialize Firebase Admin SDK
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK using separate environment variables for credentials
if (!admin.apps.length) {
  if (process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY && process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped \n with actual newlines
      })
    });
  } else {
    console.error("Firebase Admin SDK environment variables (FIREBASE_ADMIN_SDK_PRIVATE_KEY, FIREBASE_ADMIN_SDK_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are not fully set.");
    process.exit(1);
  }
}

const db = admin.firestore()

// Sample course data
const courses = [
  {
    id: "hindi-fundamentals",
    title: "Hindi Fundamentals",
    description: "Master the basics of Hindi language and culture. Learn Devanagari script, basic grammar, and essential vocabulary through interactive lessons and cultural context.",
    instructorId: "instructor-rajesh",
    instructorName: "Dr. Rajesh Kumar",
    price: 299900, // ₹2999 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 14400, // 4 hours
    enrollmentCount: 0,
    rating: 4.9,
    reviewCount: 1247,
    language: "Hindi",
    level: 'Beginner',
    tags: ["hindi", "devanagari", "culture", "beginner"],
    prerequisites: [],
    learningObjectives: [
      "Master Devanagari script reading and writing",
      "Understand basic Hindi grammar structure",
      "Build essential vocabulary for daily conversations",
      "Appreciate Hindi cultural context and traditions"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "urdu-poetry",
    title: "Urdu Poetry & Literature",
    description: "Explore the rich tradition of Urdu poetry and literature. Study classical ghazals, understand poetic forms, and appreciate the works of master poets like Ghalib and Iqbal.",
    instructorId: "instructor-fatima",
    instructorName: "Fatima Ali",
    price: 349900, // ₹3499 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 10800, // 3 hours
    enrollmentCount: 0,
    rating: 4.8,
    reviewCount: 892,
    language: "Urdu",
    level: 'Intermediate',
    tags: ["urdu", "poetry", "literature", "ghazal"],
    prerequisites: ["basic-urdu-reading"],
    learningObjectives: [
      "Understand classical Urdu poetry forms",
      "Analyze works of famous Urdu poets",
      "Appreciate the cultural significance of Urdu literature",
      "Develop skills in reading and interpreting ghazals"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "bengali-culture",
    title: "Bengali Culture & Language",
    description: "Connect with Bengali heritage through language learning. Explore Bengali literature, festivals, traditions, and modern conversational skills.",
    instructorId: "instructor-anita",
    instructorName: "Prof. Anita Das",
    price: 249900, // ₹2499 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    status: 'published',
    totalDuration: 18000, // 5 hours
    enrollmentCount: 0,
    rating: 4.7,
    reviewCount: 654,
    language: "Bengali",
    level: 'Beginner',
    tags: ["bengali", "culture", "literature", "festivals"],
    prerequisites: [],
    learningObjectives: [
      "Learn Bengali alphabet and pronunciation",
      "Understand Bengali cultural traditions",
      "Build conversational skills for daily interactions",
      "Explore Bengali literature and poetry"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "punjabi-basics",
    title: "Punjabi Basics",
    description: "Learn the fundamentals of Punjabi language and culture, including Gurmukhi script, basic grammar, and conversational phrases.",
    instructorId: "instructor-harpreet",
    instructorName: "Prof. Harpreet Singh",
    price: 279900, // ₹2799 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1599052039691-022221212121?w=400&h=300&fit=crop", // Placeholder
    status: 'published',
    totalDuration: 10800, // 3 hours
    enrollmentCount: 0,
    rating: 4.7,
    reviewCount: 950,
    language: "Punjabi",
    level: 'Beginner',
    tags: ["punjabi", "gurmukhi", "beginner", "culture"],
    prerequisites: [],
    learningObjectives: [
      "Master Gurmukhi script reading and writing",
      "Engage in basic Punjabi conversations",
      "Understand Punjabi cultural nuances and traditions"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "telugu-essentials",
    title: "Telugu Language Essentials",
    description: "Start speaking and understanding Telugu with this introductory course, covering script, basic grammar, and essential vocabulary.",
    instructorId: "instructor-anjali",
    instructorName: "Dr. Anjali Rao",
    price: 289900, // ₹2899 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1599052039691-022221212121?w=400&h=300&fit=crop", // Placeholder
    status: 'published',
    totalDuration: 12600, // 3.5 hours
    enrollmentCount: 0,
    rating: 4.6,
    reviewCount: 780,
    language: "Telugu",
    level: 'Beginner',
    tags: ["telugu", "dravidian", "beginner", "south-india"],
    prerequisites: [],
    learningObjectives: [
      "Read and write basic Telugu script",
      "Form simple Telugu sentences",
      "Understand common spoken Telugu phrases"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "tamil-foundations",
    title: "Tamil Foundations",
    description: "Build a strong base in one of the world's oldest living languages, covering script, grammar, and conversational skills.",
    instructorId: "instructor-karthik",
    instructorName: "Mr. Karthik Subramanian",
    price: 319900, // ₹3199 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1599052039691-022221212121?w=400&h=300&fit=crop", // Placeholder
    status: 'published',
    totalDuration: 14400, // 4 hours
    enrollmentCount: 0,
    rating: 4.9,
    reviewCount: 1100,
    language: "Tamil",
    level: 'Beginner',
    tags: ["tamil", "dravidian", "beginner", "ancient-language"],
    prerequisites: [],
    learningObjectives: [
      "Read and write Tamil script",
      "Understand basic Tamil grammar rules",
      "Speak simple Tamil sentences for daily interactions"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "gujarati-conversations",
    title: "Gujarati Basic Conversations",
    description: "A practical course focused on enabling you to speak and understand Gujarati in common situations for travel and daily interactions.",
    instructorId: "instructor-pooja",
    instructorName: "Ms. Pooja Sharma",
    price: 259900, // ₹2599 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1599052039691-022221212121?w=400&h=300&fit=crop", // Placeholder
    status: 'published',
    totalDuration: 9000, // 2.5 hours
    enrollmentCount: 0,
    rating: 4.5,
    reviewCount: 620,
    language: "Gujarati",
    level: 'Beginner',
    tags: ["gujarati", "conversational", "beginner", "western-india"],
    prerequisites: [],
    learningObjectives: [
      "Speak basic Gujarati phrases",
      "Understand simple questions and responses",
      "Navigate daily interactions in Gujarati"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "marathi-intro",
    title: "Marathi Introductory Course",
    description: "Learn the fundamentals of Marathi, including basic script, common phrases, and an introduction to Maharashtrian traditions.",
    instructorId: "instructor-vikram",
    instructorName: "Dr. Vikram Joshi",
    price: 269900, // ₹2699 in paise
    currency: 'INR',
    thumbnail: "https://images.unsplash.com/photo-1599052039691-022221212121?w=400&h=300&fit=crop", // Placeholder
    status: 'published',
    totalDuration: 11400, // 3.16 hours
    enrollmentCount: 0,
    rating: 4.8,
    reviewCount: 850,
    language: "Marathi",
    level: 'Beginner',
    tags: ["marathi", "maharashtra", "beginner", "culture"],
    prerequisites: [],
    learningObjectives: [
      "Read and write basic Marathi script",
      "Understand and use common Marathi phrases",
      "Appreciate Maharashtrian culture and traditions"
    ],
    completionThreshold: 80,
    unlockSequential: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
]

// Sample lessons for each course
const courseLessons = {
  "hindi-fundamentals": [
    {
      id: "lesson-1",
      title: "Introduction to Hindi Language",
      description: "Welcome to Hindi! Learn about the language's history, importance, and cultural significance in India and around the world.",
      youtubeVideoId: "dQw4w9WgXcQ", // Placeholder - replace with actual video IDs
      duration: 600, // 10 minutes
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Understand Hindi's role in Indian culture",
        "Learn about the Devanagari script origins",
        "Recognize basic Hindi sounds"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Devanagari Script - Vowels",
      description: "Master the Hindi vowels (स्वर). Learn to recognize, pronounce, and write all Hindi vowel sounds.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 900, // 15 minutes
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Write all Hindi vowels correctly",
        "Pronounce vowels with proper accent",
        "Recognize vowel sounds in words"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Devanagari Script - Consonants Part 1",
      description: "Learn the first set of Hindi consonants (व्यंजन). Practice writing and pronunciation of basic consonant sounds.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 1200, // 20 minutes
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Write basic consonants accurately",
        "Combine consonants with vowels",
        "Form simple syllables"
      ],
      resources: []
    },
    {
      id: "lesson-4",
      title: "Basic Greetings and Introductions",
      description: "Learn essential Hindi greetings and how to introduce yourself. Practice common phrases for daily interactions.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 720, // 12 minutes
      order: 3,
      isPreview: false,
      learningObjectives: [
        "Use proper Hindi greetings",
        "Introduce yourself in Hindi",
        "Ask and answer basic questions"
      ],
      resources: []
    },
    {
      id: "lesson-5",
      title: "Numbers and Counting",
      description: "Master Hindi numbers from 1 to 100. Learn to count, tell time, and use numbers in everyday situations.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 840, // 14 minutes
      order: 4,
      isPreview: false,
      learningObjectives: [
        "Count from 1 to 100 in Hindi",
        "Use numbers in practical contexts",
        "Tell time in Hindi"
      ],
      resources: []
    }
  ],
  "urdu-poetry": [
    {
      id: "lesson-1",
      title: "Introduction to Urdu Poetry",
      description: "Discover the rich tradition of Urdu poetry. Learn about its Persian and Arabic influences and cultural significance.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Understand Urdu poetry's historical context",
        "Recognize different poetic forms",
        "Appreciate cultural significance"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "The Ghazal Form",
      description: "Deep dive into the ghazal, the most celebrated form of Urdu poetry. Learn its structure, rules, and beauty.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 900,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Understand ghazal structure",
        "Identify rhyme schemes",
        "Analyze famous ghazals"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Mirza Ghalib - The Master Poet",
      description: "Study the life and works of Mirza Ghalib, one of the greatest Urdu poets. Analyze his famous couplets and style.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 1080,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Learn about Ghalib's life and era",
        "Analyze Ghalib's poetic style",
        "Understand his famous couplets"
      ],
      resources: []
    }
  ],
  "bengali-culture": [
    {
      id: "lesson-1",
      title: "Welcome to Bengali Culture",
      description: "Introduction to Bengali language and the rich cultural heritage of Bengal. Learn about festivals, traditions, and modern Bengali society.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 720,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Understand Bengali cultural diversity",
        "Learn about major festivals",
        "Recognize Bengali's global presence"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Bengali Alphabet - Vowels",
      description: "Master the Bengali vowels (স্বরবর্ণ). Learn proper pronunciation and writing techniques for all vowel sounds.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 900,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Write Bengali vowels correctly",
        "Pronounce vowels accurately",
        "Recognize vowel patterns"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Durga Puja and Bengali Festivals",
      description: "Explore the most important Bengali festival - Durga Puja. Learn festival vocabulary and cultural significance.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 1080,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Understand Durga Puja traditions",
        "Learn festival-related vocabulary",
        "Appreciate cultural significance"
      ],
      resources: []
    },
    {
      id: "lesson-4",
      title: "Basic Bengali Conversations",
      description: "Start speaking Bengali! Learn essential phrases for greetings, introductions, and daily conversations.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 960,
      order: 3,
      isPreview: false,
      learningObjectives: [
        "Greet people in Bengali",
        "Introduce yourself confidently",
        "Ask basic questions"
      ],
      resources: []
    }
  ],
  "punjabi-basics": [
    {
      id: "lesson-1",
      title: "Introduction to Gurmukhi Script",
      description: "Learn the basics of the Gurmukhi script, its origins, and how to recognize and write its fundamental characters.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Identify Gurmukhi characters",
        "Write basic Gurmukhi letters",
        "Understand the structure of the script"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Basic Greetings and Phrases",
      description: "Master essential Punjabi greetings and common phrases for daily interactions. Practice pronunciation and usage in context.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 720,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Use common Punjabi greetings",
        "Introduce oneself in Punjabi",
        "Ask and answer simple questions"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Numbers and Counting",
      description: "Learn to count in Punjabi from 1 to 100. Understand how to use numbers in various contexts, such as telling age or quantity.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Count from 1 to 100 in Punjabi",
        "Use numbers in practical situations",
        "Recognize spoken Punjabi numbers"
      ],
      resources: []
    }
  ],
  "telugu-essentials": [
    {
      id: "lesson-1",
      title: "Introduction to Telugu Script",
      description: "Get acquainted with the beautiful Telugu script. Learn to recognize and write basic vowels and consonants.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 660,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Identify Telugu vowels and consonants",
        "Practice writing basic Telugu characters",
        "Understand the flow of Telugu script"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Common Phrases and Greetings",
      description: "Learn essential Telugu phrases for greetings, introductions, and polite conversation. Focus on correct pronunciation.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 780,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Use common Telugu greetings",
        "Introduce oneself in Telugu",
        "Engage in simple polite conversations"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Numbers and Time",
      description: "Master Telugu numbers and learn how to tell time. Practice using numbers in daily contexts.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Count in Telugu",
        "Tell time in Telugu",
        "Use numbers for quantities"
      ],
      resources: []
    }
  ],
  "tamil-foundations": [
    {
      id: "lesson-1",
      title: "Introduction to Tamil Script",
      description: "Begin your journey with the ancient Tamil script. Learn to recognize and write its unique characters and basic forms.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 720,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Identify basic Tamil characters",
        "Practice writing Tamil letters",
        "Understand the structure of Tamil script"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Basic Tamil Grammar",
      description: "Understand the fundamental rules of Tamil grammar. Learn about sentence structure, verb conjugations, and noun cases.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 840,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Form grammatically correct Tamil sentences",
        "Understand basic verb forms",
        "Identify noun cases"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Greetings and Introductions",
      description: "Learn how to greet people and introduce yourself in Tamil. Practice common phrases for social interactions.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 660,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Use appropriate Tamil greetings",
        "Introduce oneself and others",
        "Engage in polite conversation"
      ],
      resources: []
    }
  ],
  "gujarati-conversations": [
    {
      id: "lesson-1",
      title: "Introduction to Gujarati Sounds",
      description: "Familiarize yourself with the unique sounds of Gujarati. Practice pronunciation of vowels and consonants.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Recognize Gujarati sounds",
        "Pronounce Gujarati vowels and consonants",
        "Understand basic phonetics"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Meeting and Greeting",
      description: "Learn essential Gujarati phrases for meeting new people and exchanging greetings. Practice common conversational starters.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 660,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Use common Gujarati greetings",
        "Introduce oneself in Gujarati",
        "Engage in simple social interactions"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Shopping and Bargaining",
      description: "Acquire practical Gujarati phrases for shopping and bargaining in local markets. Learn about currency and prices.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Ask for prices in Gujarati",
        "Bargain politely",
        "Understand numbers for transactions"
      ],
      resources: []
    }
  ],
  "marathi-intro": [
    {
      id: "lesson-1",
      title: "Introduction to Marathi Script",
      description: "Discover the Marathi script, a variant of Devanagari. Learn to recognize and write its basic characters and forms.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 0,
      isPreview: true,
      learningObjectives: [
        "Identify Marathi script characters",
        "Practice writing basic Marathi letters",
        "Understand the structure of the script"
      ],
      resources: []
    },
    {
      id: "lesson-2",
      title: "Everyday Marathi Phrases",
      description: "Learn essential Marathi phrases for daily conversations, including greetings, questions, and common expressions.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 660,
      order: 1,
      isPreview: false,
      learningObjectives: [
        "Use common Marathi greetings",
        "Form simple Marathi sentences",
        "Engage in basic conversations"
      ],
      resources: []
    },
    {
      id: "lesson-3",
      title: "Numbers and Colors",
      description: "Master Marathi numbers and learn the names of common colors. Practice using them in descriptive sentences.",
      youtubeVideoId: "dQw4w9WgXcQ",
      duration: 600,
      order: 2,
      isPreview: false,
      learningObjectives: [
        "Count in Marathi",
        "Identify and name colors",
        "Use numbers and colors in context"
      ],
      resources: []
    }
  ]
}

async function seedCourses() {
  console.log('🌱 Starting to seed courses...')
  
  try {
    for (const course of courses) {
      // Create course document
      await db.collection('courses').doc(course.id).set(course)
      console.log(`✅ Created course: ${course.title}`)
      
      // Create lessons subcollection
      const lessons = courseLessons[course.id] || []
      for (const lesson of lessons) {
        await db.collection('courses').doc(course.id).collection('lessons').doc(lesson.id).set(lesson)
        console.log(`  📚 Created lesson: ${lesson.title}`)
      }
    }
    
    console.log('🎉 Successfully seeded all courses!')
    return true
  } catch (error) {
    console.error('❌ Error seeding courses:', error)
    return false
  }
}

async function createSampleUser() {
  console.log('👤 Creating sample user...')
  
  const sampleUser = {
    uid: 'sample-user-123',
    email: 'student@example.com',
    displayName: 'Sample Student',
    firstName: 'Sample',
    lastName: 'Student',
    photoURL: '',
    preferredLanguage: 'Hindi',
    learningLevel: 'Beginner',
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    streak: 5,
    totalPoints: 250,
    enrolledCourses: ['hindi-fundamentals', 'bengali-culture'],
    completedLessons: ['hindi-fundamentals/lesson-1'],
    achievements: ['first-lesson-completed']
  }
  
  try {
    await db.collection('users').doc(sampleUser.uid).set(sampleUser)
    console.log('✅ Created sample user')
    return true
  } catch (error) {
    console.error('❌ Error creating sample user:', error)
    return false
  }
}

async function createSampleEnrollments() {
  console.log('📝 Creating sample enrollments...')
  
  const enrollments = [
    {
      id: 'sample-user-123_hindi-fundamentals',
      userId: 'sample-user-123',
      courseId: 'hindi-fundamentals',
      enrolledAt: Timestamp.now(),
      status: 'active'
    },
    {
      id: 'sample-user-123_bengali-culture',
      userId: 'sample-user-123',
      courseId: 'bengali-culture',
      enrolledAt: Timestamp.now(),
      status: 'active'
    }
  ]
  
  try {
    for (const enrollment of enrollments) {
      await db.collection('enrollments').doc(enrollment.id).set(enrollment)
      console.log(`✅ Created enrollment: ${enrollment.courseId}`)
    }
    return true
  } catch (error) {
    console.error('❌ Error creating enrollments:', error)
    return false
  }
}

async function createSampleProgress() {
  console.log('📊 Creating sample progress data...')
  
  const progressData = {
    id: 'sample-user-123_hindi-fundamentals',
    userId: 'sample-user-123',
    courseId: 'hindi-fundamentals',
    enrolledAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now(),
    currentModuleIndex: 0,
    currentLessonIndex: 1,
    overallProgress: {
      completionPercentage: 20,
      lessonsCompleted: ['lesson-1'],
      modulesCompleted: [],
      totalWatchTime: 600,
      averageSessionTime: 300
    },
    lessonProgress: {
      'lesson-1': {
        lessonId: 'lesson-1',
        isCompleted: true,
        completionPercentage: 100,
        watchedSeconds: 600,
        totalSeconds: 600,
        lastWatchedAt: Timestamp.now(),
        firstWatchedAt: Timestamp.now()
      },
      'lesson-2': {
        lessonId: 'lesson-2',
        isCompleted: false,
        completionPercentage: 45,
        watchedSeconds: 405,
        totalSeconds: 900,
        lastWatchedAt: Timestamp.now(),
        firstWatchedAt: Timestamp.now()
      }
    },
    streakData: {
      currentStreak: 5,
      lastStudyDate: Timestamp.now(),
      studyDates: [
        Timestamp.now(),
        Timestamp.fromDate(new Date(Date.now() - 86400000)), // Yesterday
        Timestamp.fromDate(new Date(Date.now() - 172800000)) // 2 days ago
      ]
    }
  }
  
  try {
    await db.collection('userProgress').doc(progressData.id).set(progressData)
    console.log('✅ Created sample progress data')
    return true
  } catch (error) {
    console.error('❌ Error creating progress data:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Firestore seeding process...')
  console.log(`📍 Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)
  
  const results = await Promise.all([
    seedCourses(),
    createSampleUser(),
    createSampleEnrollments(),
    createSampleProgress()
  ])
  
  const allSuccessful = results.every(result => result === true)
  
  if (allSuccessful) {
    console.log('\n🎉 All seeding operations completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   • 3 courses created with lessons')
    console.log('   • 1 sample user created')
    console.log('   • 2 course enrollments created')
    console.log('   • Sample progress data created')
    console.log('\n🔗 You can now:')
    console.log('   • Log in with any email to test the dashboard')
    console.log('   • View courses at /courses')
    console.log('   • Test enrollment and progress tracking')
  } else {
    console.log('\n❌ Some seeding operations failed. Check the logs above.')
  }
  
  process.exit(allSuccessful ? 0 : 1)
}

// Run the seeding process
main().catch(console.error)