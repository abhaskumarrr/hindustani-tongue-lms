# Firebase Setup Guide for Hindustani Tongue LMS

This guide will help you set up Firebase Authentication and Firestore for your language learning platform.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `hindustani-tongue-lms` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your project support email

### For Google Sign-in:
- The Web SDK configuration will be automatically set up
- Make sure to add your domain to authorized domains in production

## 3. Set up Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click **Done**

### Firestore Security Rules (for development):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read courses (add more specific rules as needed)
    match /courses/{courseId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Hindustani Tongue Web")
5. Copy the Firebase configuration object

## 5. Configure Environment Variables

1. Create or update your `.env.local` file in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDkpin7IOcS-Wybwk-n2P84PPsEQd1aJ-Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hindustani-tongue-lms.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hindustani-tongue-lms
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hindustani-tongue-lms.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1011627128879
NEXT_PUBLIC_FIREBASE_APP_ID=1:1011627128879:web:39828d0045a83c6e2c2eda
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NXEXJGVVK5
```

2. These values are already configured for your `hindustani-tongue-lms` Firebase project

## 6. Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/signup`
3. Try creating an account with email/password
4. Check Firebase Console > Authentication > Users to see if the user was created
5. Check Firestore > Data to see if user profile was created

## 7. Production Setup

### Security Rules for Production:
Update your Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Course data - read only for authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
    }
    
    // User progress - users can only access their own progress
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Authorized Domains:
1. Go to Authentication > Settings > Authorized domains
2. Add your production domain (e.g., `yourdomain.com`)

## 8. Optional: Set up Firebase Admin SDK

For server-side operations, you might want to set up Firebase Admin SDK:

1. Go to Project Settings > Service accounts
2. Generate a new private key
3. Store the JSON file securely (not in your repository)
4. Set up environment variables for server-side authentication

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check that all environment variables are set correctly
   - Ensure `.env.local` is in the project root
   - Restart your development server

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add `localhost:3000` to authorized domains in Firebase Console
   - For production, add your actual domain

3. **Google Sign-in not working:**
   - Ensure Google provider is enabled in Firebase Console
   - Check that Web SDK configuration is correct
   - Verify authorized domains include your development and production URL

4. **Firestore permission denied:**
   - Check your Firestore security rules
   - Ensure user is authenticated before accessing Firestore

## Data Structure

The app creates the following Firestore structure:

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── firstName: string
├── lastName: string
├── photoURL: string
├── preferredLanguage: string
├── learningLevel: string
├── createdAt: timestamp
├── lastLoginAt: timestamp
├── streak: number
├── totalPoints: number
├── enrolledCourses: array
├── completedLessons: array
└── achievements: array
```

This structure supports the learning management system's features like progress tracking, achievements, and course enrollment.