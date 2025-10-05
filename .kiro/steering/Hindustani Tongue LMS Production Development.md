Primary Directive
You are building a production-ready Learning Management System for Hindustani Tongue, not a prototype or demo. Every line of code must be scalable, secure, maintainable, and ready for real users and revenue. This is a commercial product that will handle payments, user data, and educational content.
Critical Requirements
Business Context

Target Market: Indian language learning for diaspora community
Revenue Model: Course sales via Razorpay payments (2% transaction fee only cost)
Core Feature: 80% video completion rule for lesson unlocking
User Base: Plan for 500 active users initially, scaling to thousands
Timeline: 12-week development cycle for MVP launch

Technology Stack (Non-Negotiable)

Frontend: Next.js 14 with TypeScript, Tailwind CSS
Backend: Firebase (Auth, Firestore, Functions, Storage) - Free tier only
Video Hosting: YouTube Unlisted videos only
Payments: Razorpay Standard Checkout
Deployment: Vercel (free tier)
Email: Firebase Extensions for notifications

MCP Tools Utilization Strategy
Required MCP Integrations

File System MCP: For reading existing project structure and maintaining consistency
Git MCP: For proper version control and branch management
Firebase MCP: For database operations and security rule management
Testing MCP: For automated test generation and execution
Linting/Formatting MCP: For code quality and consistency

MCP Tool Usage Instructions

Always use File System MCP to check existing code before writing new components
Use Git MCP for proper commit messages and branch management per feature
Leverage Firebase MCP for schema validation and security rule testing
Integrate Testing MCP to generate unit tests for each component automatically
Use Linting MCP to maintain consistent code style across the project

Code Quality Standards
Production-Ready Code Requirements

TypeScript Strict Mode: All code must have proper type definitions
Error Handling: Comprehensive try-catch blocks with user-friendly error messages
Loading States: Every async operation needs proper loading and error states
Input Validation: All user inputs validated both client and server-side
Security: Firebase Security Rules must be tested and validated
Performance: Optimize for mobile users on slow connections
Accessibility: WCAG 2.1 AA compliance for all UI components

File Structure Standards
src/
├── app/                    # Next.js 13+ app directory
├── components/            # Reusable UI components with tests
├── lib/                   # Business logic and utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
└── __tests__/            # Test files
Component Development Rules

Every component needs a corresponding test file
Props must be properly typed with interfaces
Error boundaries for all major sections
Loading skeletons for async content
Mobile-first responsive design

Critical Implementation Guidelines
Authentication & Security

Never store sensitive data in localStorage
Always validate user permissions before data access
Implement proper CSRF protection
Use Firebase Security Rules as primary authorization layer
Log all security-relevant events for audit

Payment Processing

All payment flows must be thoroughly tested
Handle all Razorpay webhook events properly
Implement idempotency for payment processing
Never trust client-side payment verification
Log all payment events with proper error tracking

Video Progress Tracking

80% completion rule is business-critical - must be tamper-proof
Progress tracking must work offline with sync
Use server-side validation for lesson unlocking
Implement proper conflict resolution for progress data
Track detailed analytics for completion rates

Database Design

Optimize for Firestore's pricing model (minimize reads/writes)
Use compound indexes for complex queries
Implement proper data denormalization for performance
Design for eventual consistency
Plan for data migration and schema changes

Development Workflow
Before Writing Any Code

Check existing project structure using File System MCP
Review related components to maintain consistency
Validate the approach against business requirements
Plan the implementation with proper error handling
Consider mobile users and slow connections

Code Implementation Process

Write TypeScript interfaces first
Implement core logic with comprehensive error handling
Add loading states and user feedback
Write unit tests using Testing MCP
Test manually on mobile devices
Use Git MCP for proper version control

Quality Assurance Checklist

 TypeScript compiles without warnings
 All async operations have loading/error states
 Mobile responsive on 320px+ screens
 Firebase Security Rules tested
 Unit tests pass with >80% coverage
 Performance tested on 3G connection
 Accessibility validated with screen reader

Business Logic Implementation
Revenue Protection

Course access must be verified server-side
Payment status checked before content delivery
Session management to prevent account sharing
Audit logs for all revenue-impacting actions

User Experience Priorities

Loading speed (especially on mobile)
Clear error messages with recovery options
Consistent navigation and UI patterns
Offline functionality where possible
Cultural sensitivity in design and content

Scalability Considerations

Design for Firebase free tier limits
Implement caching to reduce database reads
Plan for CDN integration for static assets
Monitor usage to avoid surprise costs

Human Collaboration Requirements
When to Ask for Human Input

Business logic clarification needed
Design decisions impacting user experience
Technical architecture choices with trade-offs
Security implementation questions
Third-party service integration details

Required Human Approval Before Implementation

Database schema changes
Firebase Security Rules modifications
Payment flow modifications
Authentication system changes
Core business logic alterations

Error Prevention
Common Pitfalls to Avoid

Building prototype-quality code
Ignoring mobile users
Not handling Firebase quota limits
Weak error handling
Security vulnerabilities in Firebase rules
Poor performance on slow connections
Not testing payment flows thoroughly

Required Testing

Unit tests for all business logic
Integration tests for payment flows
End-to-end tests for critical user journeys
Performance testing under load
Security testing of Firebase rules

Success Metrics
Technical Success Criteria

Page load time < 3 seconds on 3G
Video player loads < 5 seconds
99%+ progress tracking accuracy
<2% payment processing failures
Zero security vulnerabilities

Business Success Criteria

70%+ course completion rates
<3% customer support tickets per user
95%+ user satisfaction in testing
Ability to handle 500+ concurrent users

Final Reminders

This is a real business, not a coding exercise
Every feature must be production-ready before moving to the next
Security and performance are not optional
Always consider the end user's experience
Use MCP tools to maintain code quality and consistency
Ask for human guidance when business requirements are unclear

Your goal is to build a platform that can compete with established LMS providers while maintaining the unique 80% completion advantage. The code you write today must support thousands of users and handle real revenue transactions.<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:   
-------------------------------------------------------------------------------------> 