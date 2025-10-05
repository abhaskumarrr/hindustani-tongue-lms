const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, addDoc } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkpin7IOcS-Wybwk-n2P84PPsEQd1aJ-Q",
  authDomain: "hindustani-tongue-lms.firebaseapp.com",
  projectId: "hindustani-tongue-lms",
  storageBucket: "hindustani-tongue-lms.firebasestorage.app",
  messagingSenderId: "1011627128879",
  appId: "1:1011627128879:web:39828d0045a83c6e2c2eda",
  measurementId: "G-NXEXJGVVK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleCourses = [
  {
    title: "Hindi Fundamentals",
    description: "Master the basics of Hindi language and culture. This course is perfect for beginners who want to learn the Devanagari script, basic grammar, and common phrases.",
    instructorId: "instructor-1",
    instructorName: "Dr. Rajesh Kumar",
    price: 299900,
    currency: 'INR',
    thumbnail: "/hindi-devanagari-script.jpg",
    status: 'published',
    lessons: [
      { id: "lesson-1", title: "Introduction to Devanagari", description: "Learn the basics of the Devanagari script.", youtubeVideoId: "nUP1OkRQSVE", duration: 600, order: 1, isPreview: true, learningObjectives: [], resources: [], quiz: null },
      { id: "lesson-2", title: "Basic Grammar", description: "Understand the fundamental grammar rules of Hindi.", youtubeVideoId: "nUP1OkRQSVE", duration: 900, order: 2, isPreview: false, learningObjectives: [], resources: [], quiz: null },
      { id: "lesson-3", title: "Common Phrases", description: "Learn common phrases for everyday conversations.", youtubeVideoId: "nUP1OkRQSVE", duration: 700, order: 3, isPreview: false, learningObjectives: [], resources: [], quiz: null },
    ],
    totalDuration: 3600,
    enrollmentCount: 150,
    rating: 4.8,
    reviewCount: 45,
    language: "Hindi",
    level: 'Beginner',
    tags: ["Hindi", "Beginner", "Language"],
    prerequisites: [],
    learningObjectives: [
      "Learn the Devanagari script",
      "Understand basic Hindi grammar",
      "Learn common phrases for everyday conversations",
      "Get an introduction to Indian culture"
    ],
    features: [
        "Native pronunciation training",
        "Cultural insights and context",
        "Interactive exercises and quizzes",
        "Certificate of completion",
        "Lifetime access to content",
        "Mobile app access",
        "Community forum access",
        "Progress tracking"
    ],
    requirements: [
        "No prior knowledge of Hindi required",
        "Access to computer or mobile device",
        "Internet connection for video lessons",
        "Dedication of 3-4 hours per week"
    ],
    completionThreshold: 80,
    unlockSequential: true,
  },
  {
    title: "Urdu Poetry & Literature",
    description: "Explore the beauty of Urdu through classical poetry and literature. This course is for those who have a basic understanding of Urdu and want to delve deeper into its rich literary tradition.",
    instructorId: "instructor-2",
    instructorName: "Prof. Fatima Sheikh",
    price: 399900,
    currency: 'INR',
    thumbnail: "/urdu-calligraphy.jpg",
    status: 'published',
    lessons: [
        { id: "lesson-1", title: "Introduction to Urdu Poetry", description: "An introduction to the rich tradition of Urdu poetry.", youtubeVideoId: "nUP1OkRQSVE", duration: 800, order: 1, isPreview: true, learningObjectives: [], resources: [], quiz: null },
        { id: "lesson-2", title: "Famous Urdu Poets", description: "Learn about the lives and works of famous Urdu poets.", youtubeVideoId: "nUP1OkRQSVE", duration: 1200, order: 2, isPreview: false, learningObjectives: [], resources: [], quiz: null },
    ],
    totalDuration: 5400,
    enrollmentCount: 120,
    rating: 4.9,
    reviewCount: 60,
    language: "Urdu",
    level: 'Intermediate',
    tags: ["Urdu", "Intermediate", "Literature"],
    prerequisites: ["Basic understanding of Urdu"],
    learningObjectives: [
      "Understand the nuances of Urdu poetry",
      "Learn about famous Urdu poets and their works",
      "Improve your Urdu vocabulary and pronunciation",
      "Appreciate the cultural context of Urdu literature"
    ],
    features: [
        "Classical poetry analysis",
        "Modern literature exploration",
        "Cultural and historical context",
        "Writing practice sessions",
        "Expert instructor feedback",
        "Literary discussion forums",
        "Certificate of completion",
        "Lifetime access"
    ],
    requirements: [
        "Basic knowledge of Urdu script",
        "Interest in literature and poetry",
        "Intermediate reading level in Urdu",
        "Commitment to weekly assignments"
    ],
    completionThreshold: 80,
    unlockSequential: true,
  },
  {
    title: "Bengali for Beginners",
    description: "Learn the basics of the Bengali language, from the alphabet to simple conversations. This course is designed for absolute beginners.",
    instructorId: "instructor-3",
    instructorName: "Ananya Das",
    price: 249900,
    currency: 'INR',
    thumbnail: "/bengali-script.jpg",
    status: 'published',
    lessons: [
        { id: "lesson-1", title: "The Bengali Alphabet", description: "Learn the letters of the Bengali alphabet.", youtubeVideoId: "nUP1OkRQSVE", duration: 900, order: 1, isPreview: true, learningObjectives: [], resources: [], quiz: null },
        { id: "lesson-2", title: "Basic Conversations", description: "Learn how to have simple conversations in Bengali.", youtubeVideoId: "nUP1OkRQSVE", duration: 1100, order: 2, isPreview: false, learningObjectives: [], resources: [], quiz: null },
    ],
    totalDuration: 3000,
    enrollmentCount: 90,
    rating: 4.7,
    reviewCount: 30,
    language: "Bengali",
    level: 'Beginner',
    tags: ["Bengali", "Beginner", "Language"],
    prerequisites: [],
    learningObjectives: [
      "Learn the Bengali alphabet",
      "Understand basic Bengali grammar",
      "Learn common phrases for everyday conversations",
      "Get an introduction to Bengali culture"
    ],
    features: [
        "Native pronunciation training",
        "Cultural insights and context",
        "Interactive exercises and quizzes",
        "Certificate of completion",
        "Lifetime access to content",
    ],
    requirements: [
        "No prior knowledge of Bengali required",
        "Access to computer or mobile device",
        "Internet connection for video lessons"
    ],
    completionThreshold: 80,
    unlockSequential: true,
  }
];

async function clearCourses() {
  console.log("Clearing existing courses...");
  const coursesCollection = collection(db, 'courses');
  const querySnapshot = await getDocs(coursesCollection);
  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log("Existing courses cleared.");
}

async function seedDatabase() {
  await clearCourses();

  console.log("Starting to seed the database...");

  const coursesCollection = collection(db, 'courses');

  for (const course of sampleCourses) {
    try {
      // Add createdAt and updatedAt timestamps
      const courseWithTimestamps = {
        ...course,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(coursesCollection, courseWithTimestamps);
      console.log(`Added course: ${course.title}`);
    } catch (error) {
      console.error(`Error adding course: ${course.title}`, error);
    }
  }

  console.log("Database seeding completed.");
}

seedDatabase();