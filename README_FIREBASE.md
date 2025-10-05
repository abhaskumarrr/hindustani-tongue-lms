# Firebase Integration - Hindustani Tongue LMS

This document explains the Firebase authentication and database integration that has been added to your Hindustani Tongue LMS application.

## 🔥 What's Been Added

### 1. Firebase Authentication
- **Email/Password authentication**
- **Google OAuth integration**
- **User profile management**
- **Protected routes**

### 2. Firestore Database
- **User profiles with learning data**
- **Course enrollment tracking**
- **Progress and achievements**
- **Real-time data synchronization**

### 3. New Files Created

```
lib/
├── firebase.ts          # Firebase configuration
├── auth.ts             # Authentication functions
└── courses.ts          # Course management functions

contexts/
└── AuthContext.tsx     # React context for auth state

components/
└── ProtectedRoute.tsx  # Route protection component

hooks/
└── useAuthRedirect.ts  # Custom auth redirect hook

middleware.ts           # Next.js middleware for route protection
.env.local             # Environment variables (you need to configure)
FIREBASE_SETUP.md      # Detailed setup instructions
```

## 🚀 Quick Start

### 1. Install Dependencies
The Firebase package has already been installed:
```bash
npm install firebase
```

### 2. Set Up Firebase Project
Follow the detailed instructions in `FIREBASE_SETUP.md` to:
- Create a Firebase project
- Enable Authentication providers
- Set up Firestore database
- Get your configuration keys

### 3. Configure Environment Variables
Update your `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔐 Authentication Features

### Sign Up Flow
1. **Step 1**: Basic information (name, email, password)
2. **Step 2**: Language preferences and learning level
3. **Step 3**: Welcome screen with next steps

### Sign In Options
- Email and password
- Google OAuth (one-click)
- Remember me functionality

### User Profile Data
Each user gets a comprehensive profile in Firestore:

```typescript
interface UserData {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  photoURL?: string
  preferredLanguage?: string    // Selected during signup
  learningLevel?: string        // Beginner, Intermediate, Advanced
  createdAt: timestamp
  lastLoginAt: timestamp
  streak: number               // Learning streak days
  totalPoints: number          // Gamification points
  enrolledCourses: string[]    // Course IDs
  completedLessons: string[]   // Lesson IDs
  achievements: string[]       // Achievement IDs
}
```

## 📱 Updated Pages

### Login Page (`/login`)
- Real Firebase authentication
- Social login buttons
- Form validation and error handling
- Loading states
- Automatic redirect after login

### Signup Page (`/signup`)
- Multi-step registration process
- User preference collection
- Profile creation in Firestore
- Welcome flow

### Dashboard (`/dashboard`)
- Real user data from Firestore
- Dynamic user information
- Proper sign-out functionality
- Loading states

## 🛡️ Security Features

### Route Protection
- Middleware-based route protection
- Automatic redirects for unauthenticated users
- Protected routes: `/dashboard`, `/courses`, `/learn`
- Public routes redirect authenticated users

### Firestore Security Rules
Basic security rules are provided in the setup guide:
- Users can only access their own data
- Authenticated users can read course data
- Proper data validation

## 🎯 Key Functions

### Authentication (`lib/auth.ts`)
```typescript
// Sign up with email
signUpWithEmail(email, password, firstName, lastName, additionalData)

// Sign in with email
signInWithEmail(email, password)

// Social authentication
signInWithGoogle()

// User management
getUserData(uid)
updateUserProfile(uid, data)
signOutUser()
```

### Course Management (`lib/courses.ts`)
```typescript
// Course enrollment
enrollInCourse(userId, courseId)
isEnrolledInCourse(userId, courseId)

// Progress tracking
markLessonCompleted(userId, lessonId)
updateUserProgress(userId, pointsToAdd)
```

## 🎨 UI Improvements

### Loading States
- Skeleton loading for dashboard
- Button loading states during auth
- Proper loading indicators

### Error Handling
- Toast notifications for errors
- Form validation messages
- Network error handling

### User Experience
- Automatic redirects
- Persistent login state
- Real-time data updates

## 🔄 Auth Context

The `AuthContext` provides:
- Current user state
- User profile data from Firestore
- Loading states
- Refresh functionality

Usage in components:
```typescript
const { user, userData, loading, refreshUserData } = useAuth()
```

## 🚦 Next Steps

### Immediate Setup
1. Follow `FIREBASE_SETUP.md` to configure Firebase
2. Update `.env.local` with your Firebase keys
3. Test authentication flow
4. Verify user data in Firestore

### Future Enhancements
1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement forgot password functionality
3. **Profile Management**: Add user profile editing
4. **Course Progress**: Implement detailed progress tracking
5. **Achievements System**: Add gamification features
6. **Admin Panel**: Create instructor/admin interfaces

### Production Considerations
1. Update Firestore security rules
2. Set up proper error monitoring
3. Configure authorized domains
4. Implement rate limiting
5. Add data backup strategies

## 🐛 Troubleshooting

### Common Issues
1. **Environment variables not loading**: Restart dev server after updating `.env.local`
2. **Firebase configuration errors**: Double-check all config values
3. **Authentication not working**: Verify Firebase project settings
4. **Firestore permission denied**: Check security rules

### Debug Tips
- Check browser console for Firebase errors
- Verify Firebase project configuration
- Test with Firebase Auth emulator for development
- Use Firestore rules simulator

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

Your Hindustani Tongue LMS now has a complete authentication system with user management, ready for your language learning platform! 🎉