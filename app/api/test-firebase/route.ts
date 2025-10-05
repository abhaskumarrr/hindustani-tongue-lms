import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    // Test Firebase connection
    const coursesSnapshot = await getDocs(collection(db, 'courses'))
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      coursesCount: coursesSnapshot.size,
      courses: coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }))
    })
  } catch (error) {
    console.error('Firebase test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}