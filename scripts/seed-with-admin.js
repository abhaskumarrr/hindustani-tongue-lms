#!/usr/bin/env node

/**
 * Proper Firebase Admin SDK seeding script
 * This uses service account authentication for Firebase Admin SDK
 */

require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')

// Initialize Firebase Admin with project ID only (for emulator or local development)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // For production, you'd add serviceAccountKey here
  })
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
  ]
}

async function seedCourses() {
  console.log('🌱 Starting to seed courses...')
  
  try {
    const batch = db.batch()
    
    for (const course of courses) {
      // Create course document
      const courseRef = db.collection('courses').doc(course.id)
      batch.set(courseRef, course)
      console.log(`✅ Prepared course: ${course.title}`)
      
      // Create lessons subcollection
      const lessons = courseLessons[course.id] || []
      for (const lesson of lessons) {
        const lessonRef = db.collection('courses').doc(course.id).collection('lessons').doc(lesson.id)
        batch.set(lessonRef, lesson)
        console.log(`  📚 Prepared lesson: ${lesson.title}`)
      }
    }
    
    // Commit the batch
    await batch.commit()
    console.log('🎉 Successfully seeded all courses!')
    return true
  } catch (error) {
    console.error('❌ Error seeding courses:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Firestore seeding process...')
  console.log(`📍 Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)
  
  const success = await seedCourses()
  
  if (success) {
    console.log('\n🎉 Seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   • 3 courses created with lessons')
    console.log('   • Hindi Fundamentals (5 lessons)')
    console.log('   • Urdu Poetry (3 lessons)')
    console.log('   • Bengali Culture (4 lessons)')
    console.log('\n🔗 You can now:')
    console.log('   • View courses at /courses')
    console.log('   • Test enrollment and progress tracking')
    console.log('   • Browse the learning interface')
  } else {
    console.log('\n❌ Seeding failed. Check the logs above.')
  }
  
  process.exit(success ? 0 : 1)
}

// Run the seeding process
main().catch(console.error)