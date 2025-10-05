import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

// Auth providers
export const googleProvider = new GoogleAuthProvider()

// User data interface
export interface UserData {
    uid: string
    email: string
    displayName: string
    firstName: string
    lastName: string
    photoURL?: string
    preferredLanguage?: string
    learningLevel?: string
    createdAt: any
    lastLoginAt: any
    streak: number
    totalPoints: number
    enrolledCourses: string[]
    completedLessons: string[]
    achievements: string[]
}

// Configure auth persistence based on remember me
export const setAuthPersistence = async (rememberMe: boolean) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
}

// Create user profile in Firestore
export const createUserProfile = async (user: User, additionalData?: any) => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user
        const [firstName, lastName] = displayName?.split(' ') || ['', '']

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName: displayName || `${firstName} ${lastName}`.trim(),
                firstName: firstName || '',
                lastName: lastName || '',
                photoURL: photoURL || '',
                preferredLanguage: '',
                learningLevel: '',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                streak: 0,
                totalPoints: 0,
                enrolledCourses: [],
                completedLessons: [],
                achievements: [],
                ...additionalData,
            })
        } catch (error) {
            console.error('Error creating user profile:', error)
            throw error
        }
    } else {
        // Update last login time
        try {
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
            })
        } catch (error) {
            console.error('Error updating last login:', error)
        }
    }

    return userRef
}

// Sign up with email and password
export const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: any
) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)

        // Update the user's display name
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`.trim(),
        })

        // Create user profile in Firestore
        await createUserProfile(user, {
            firstName,
            lastName,
            ...additionalData,
        })

        return user
    } catch (error) {
        console.error('Error signing up:', error)
        throw error
    }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        await createUserProfile(user) // Update last login
        return user
    } catch (error) {
        console.error('Error signing in:', error)
        throw error
    }
}

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const { user } = await signInWithPopup(auth, googleProvider)
        await createUserProfile(user)
        return user
    } catch (error) {
        console.error('Error signing in with Google:', error)
        throw error
    }
}



// Sign out
export const signOutUser = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error('Error signing out:', error)
        throw error
    }
}

// Send password reset email
export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email)
    } catch (error) {
        console.error('Error sending password reset email:', error)
        throw error
    }
}

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            return userSnap.data() as UserData
        }
        return null
    } catch (error) {
        console.error('Error getting user data:', error)
        return null
    }
}

// Update user profile
export const updateUserProfile = async (uid: string, data: Partial<UserData>) => {
    try {
        const userRef = doc(db, 'users', uid)
        await updateDoc(userRef, data)
    } catch (error) {
        console.error('Error updating user profile:', error)
        throw error
    }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}