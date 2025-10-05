# Hindustani Tongue LMS - Free-Stack MVP Requirements

## Introduction

This document defines the minimum viable requirements for building a Learning Management System for Hindustani Tongue using only free services and tools. The focus is on generating revenue immediately while keeping operational costs at zero until the business proves viability.

**Core Business Objective:** Launch a profitable LMS that can process payments and deliver the unique 80% video completion experience using entirely free infrastructure.

## MVP Requirements (Launch-Ready)

### Category 1: Payment Processing & Revenue Management

#### Requirement 1.1
**User Story:** As a student, I want to purchase courses securely using Indian payment methods, so that I can access premium content easily.

**Acceptance Criteria:**
1. WHEN a student selects a course THEN the system SHALL display pricing in INR
2. WHEN processing payment THEN the system SHALL support Razorpay payment gateway
3. WHEN payment succeeds THEN the system SHALL immediately grant course access via Firebase
4. WHEN payment fails THEN the system SHALL show clear error message and allow retry
5. WHEN purchasing THEN the system SHALL send confirmation email using Firebase Extensions

**Implementation:** Razorpay Standard Checkout (free tier), Firebase Functions for payment webhooks

#### Requirement 1.2
**User Story:** As a platform owner, I want basic revenue tracking, so that I can monitor business performance.

**Acceptance Criteria:**
1. WHEN payments are processed THEN the system SHALL log all transactions in Firestore
2. WHEN viewing dashboard THEN the system SHALL display total revenue and transaction count
3. WHEN payments are completed THEN the system SHALL update user enrollment status
4. WHEN refunds are needed THEN the system SHALL handle them manually through Razorpay dashboard
5. WHEN generating reports THEN the system SHALL export transaction data as CSV

### Category 2: Core Learning Experience

#### Requirement 2.1
**User Story:** As a student, I want my video progress tracked so that I unlock lessons only after completing 80% of the current video.

**Acceptance Criteria:**
1. WHEN a student watches a video THEN the system SHALL track progress using YouTube IFrame API
2. WHEN progress reaches 80% THEN the system SHALL mark the lesson as completed in Firestore
3. WHEN a lesson is completed THEN the system SHALL unlock the next lesson automatically
4. WHEN a student returns THEN the system SHALL resume from the last saved position
5. WHEN progress updates fail THEN the system SHALL cache locally and retry on reconnect

**Platform:** YouTube Unlisted videos only
**Technical Implementation:** Firebase Firestore for progress storage, localStorage for offline caching

#### Requirement 2.2
**User Story:** As a student, I want to navigate through a structured course curriculum with clear progress indicators.

**Acceptance Criteria:**
1. WHEN viewing a course THEN the system SHALL display all modules and lessons in order
2. WHEN a lesson is locked THEN the system SHALL show a lock icon and explain 80% requirement
3. WHEN progress is made THEN the system SHALL update progress bars in real-time
4. WHEN a course is completed THEN the system SHALL generate a completion certificate
5. WHEN viewing curriculum THEN the system SHALL show lesson duration and completion status

### Category 3: Basic Content Protection

#### Requirement 3.1
**User Story:** As a platform owner, I want to ensure only paying students can access premium content.

**Acceptance Criteria:**
1. WHEN accessing a lesson THEN the system SHALL verify course enrollment in Firestore
2. WHEN enrollment is missing THEN the system SHALL redirect to purchase page
3. WHEN videos load THEN the system SHALL use YouTube unlisted URLs with referrer restrictions
4. WHEN detecting suspicious activity THEN the system SHALL log incidents in Firestore
5. WHEN users share accounts THEN the system SHALL limit concurrent sessions to 2 devices

**Implementation:** Firebase Security Rules for access control, YouTube domain restrictions

### Category 4: Essential User Management

#### Requirement 4.1
**User Story:** As a student, I want to create an account and manage my purchased courses.

**Acceptance Criteria:**
1. WHEN registering THEN the system SHALL use Firebase Authentication (email/password)
2. WHEN logging in THEN the system SHALL maintain session for 30 days
3. WHEN viewing dashboard THEN the system SHALL show purchased courses and progress
4. WHEN updating profile THEN the system SHALL save changes to Firestore
5. WHEN forgetting password THEN the system SHALL use Firebase password reset

### Category 5: Basic Support System

#### Requirement 5.1
**User Story:** As a student, I want to get help when I encounter issues or have questions.

**Acceptance Criteria:**
1. WHEN needing help THEN the system SHALL provide contact email prominently displayed
2. WHEN submitting questions THEN the system SHALL use a simple contact form with Firebase Functions
3. WHEN common issues occur THEN the system SHALL provide FAQ page with solutions
4. WHEN urgent technical issues arise THEN the system SHALL provide WhatsApp contact option
5. WHEN students need guidance THEN the system SHALL include video tutorials for common tasks

**Implementation:** Simple email forwarding via Firebase Functions, no ticketing system

### Category 6: Content Management & Quality Assurance

#### Requirement 6.1
**User Story:** As an instructor, I want to upload and organize course content easily.

**Acceptance Criteria:**
1. WHEN creating courses THEN the system SHALL provide simple form-based course creation
2. WHEN uploading videos THEN the system SHALL support YouTube upload links only
3. WHEN organizing content THEN the system SHALL allow drag-and-drop lesson reordering
4. WHEN publishing courses THEN the system SHALL require admin approval via Firebase
5. WHEN managing content THEN the system SHALL provide basic course analytics (views, completions)

#### Requirement 6.2
**User Story:** As a platform owner, I want basic quality control for course content.

**Acceptance Criteria:**
1. WHEN content is submitted THEN the system SHALL require manual review before publishing
2. WHEN videos are added THEN the system SHALL validate YouTube URLs are accessible
3. WHEN courses are created THEN the system SHALL require minimum content standards (10+ lessons)
4. WHEN quality issues are found THEN the system SHALL provide instructor feedback via email
5. WHEN content is approved THEN the system SHALL automatically make it available to students

### Category 7: Basic Analytics & Business Intelligence

#### Requirement 7.1
**User Story:** As a platform owner, I want basic analytics to understand business performance.

**Acceptance Criteria:**
1. WHEN analyzing performance THEN the system SHALL track key metrics in Firestore
2. WHEN viewing dashboard THEN the system SHALL show student count, revenue, completion rates
3. WHEN measuring success THEN the system SHALL calculate basic conversion rates
4. WHEN reviewing courses THEN the system SHALL show per-course enrollment and completion data
5. WHEN making decisions THEN the system SHALL export data for external analysis

**Implementation:** Basic Firestore aggregations, Google Sheets integration for reporting

#### Requirement 7.2
**User Story:** As an instructor, I want to see how my courses are performing with students.

**Acceptance Criteria:**
1. WHEN students engage THEN the system SHALL track completion rates per lesson
2. WHEN courses are accessed THEN the system SHALL log student activity timestamps
3. WHEN performance is reviewed THEN the system SHALL show drop-off points in courses
4. WHEN improvements are needed THEN the system SHALL highlight lessons with low completion
5. WHEN revenue is generated THEN the system SHALL show total earnings per course

### Category 8: Legal Compliance & Data Protection

#### Requirement 8.1
**User Story:** As a platform owner, I want basic compliance with Indian data protection laws.

**Acceptance Criteria:**
1. WHEN users register THEN the system SHALL obtain consent for data processing
2. WHEN collecting data THEN the system SHALL limit to essential information only
3. WHEN storing data THEN the system SHALL use Firebase's built-in security features
4. WHEN users request deletion THEN the system SHALL provide manual data deletion process
5. WHEN handling payments THEN the system SHALL rely on Razorpay's PCI compliance

**Implementation:** Basic privacy policy, terms of service, manual compliance procedures

## Technical Architecture

### Free Stack Components
- **Frontend:** Next.js hosted on Vercel (free tier)
- **Backend:** Firebase (Spark plan - free tier)
- **Database:** Firestore (free tier: 50,000 reads, 20,000 writes per day)
- **Authentication:** Firebase Auth (free)
- **Video Hosting:** YouTube Unlisted (free, unlimited)
- **Payments:** Razorpay (2% transaction fee only)
- **Email:** Firebase Extensions - Trigger Email (free tier)
- **Analytics:** Firebase Analytics + Google Analytics (free)
- **Domain:** Freenom or existing domain

### Performance Targets
- Page load time < 3 seconds
- Video player loads within 5 seconds
- Progress tracking updates every 30 seconds
- System handles 100 concurrent users

### Scaling Limits (Free Tier)
- **Firestore:** 50,000 reads/day (≈ 500 active users)
- **Firebase Functions:** 125,000 invocations/month
- **Vercel:** 100GB bandwidth/month
- **YouTube:** Unlimited video storage and bandwidth

## Success Metrics

### Launch Success (0-3 months)
- 50 paying students enrolled
- 70% course completion rate
- <3% payment failure rate
- Monthly revenue of ₹50,000+ ($600+)

### Growth Targets (3-6 months)
- 200 paying students enrolled
- 75% course completion rate
- Basic instructor onboarding process
- Monthly revenue of ₹200,000+ ($2,400+)

## Risk Mitigation

### Free Tier Limits
- **Monitor Firestore usage** daily to avoid overage charges
- **YouTube account backup** in case of policy violations
- **Razorpay alternatives** (Instamojo) as payment backup

### Business Risks
- **Content piracy:** YouTube's built-in protections, manual monitoring
- **Payment disputes:** Handle manually through Razorpay dashboard
- **Customer support:** Scale gradually with WhatsApp Business (free)

### Technical Risks
- **Firebase limits:** Implement usage monitoring and alerts
- **Video platform dependency:** Maintain content backups
- **Performance degradation:** Optimize queries and implement caching

## Implementation Timeline

### Week 1-2: Foundation
- Firebase project setup with authentication
- Basic course structure and Firestore schema
- YouTube video integration with progress tracking

### Week 3-4: Payments & Access Control
- Razorpay integration for course purchases
- Firebase Security Rules for content protection
- Student dashboard with purchased courses

### Week 5-6: Content Management
- Instructor course creation interface
- Admin approval workflow
- Basic analytics dashboard

### Week 7-8: Polish & Launch
- User testing and bug fixes
- FAQ and support documentation
- Marketing site and launch preparation

This MVP focuses exclusively on generating revenue with zero operational costs while providing the core 80% video completion experience that differentiates Hindustani Tongue from competitors.

# Project Requirements

## Completed Features
- [x] Setup Next.js 14 with TypeScript
- [x] Configure Tailwind CSS
- [x] Implement basic page routing
- [x] Create a responsive navigation bar

## Pending Features
- [ ] User authentication system
- [ ] Database integration with Supabase
- [ ] Dark mode toggle
- [ ] API route for data fetching
- [ ] Responsive design for mobile devices
- [ ] Unit testing setup

# Prioritized Action Plan for Immediate Fixes

## High Priority (Critical for basic functionality)
1. [ ] **Fix Tailwind CSS configuration** - Create proper tailwind.config.ts and ensure it's correctly integrated
2. [ ] **Enable ESLint and TypeScript checking** - Remove ignoreDuringBuilds and ignoreBuildErrors from next.config.mjs to catch issues early
3. [ ] **Optimize images configuration** - Remove unoptimized: true from next.config.mjs to improve performance

## Medium Priority (Important features)
4. [ ] **Implement authentication context** - Set up contexts/auth-context.tsx for user management
5. [ ] **Create responsive navigation** - Implement a mobile-friendly navigation bar in components/
6. [ ] **Set up database integration** - Configure Supabase client in lib/ directory

## Low Priority (Enhancements)
7. [ ] **Add dark mode support** - Create theme context and toggle component
8. [ ] **Implement API routes** - Set up data fetching endpoints in app/api/
9. [ ] **Configure testing framework** - Properly set up unit tests with Vitest
10. [ ] **Add proper error handling** - Implement global error boundaries