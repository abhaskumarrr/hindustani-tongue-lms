# Hindustani Tongue LMS

Hindustani Tongue LMS is a language learning platform for Indian languages. This project is built with Next.js, TypeScript, Tailwind CSS, and Firebase. It features an interactive map of India that showcases the linguistic diversity of the country.

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 4.1.9 with custom CSS variables
- **UI Components**: shadcn/ui (New York style) with Radix UI
- **Animations**: tailwindcss-animate + custom CSS animations
- **Icons**: Lucide React
- **Architecture**: App router with component-based structure

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hindustani-tongue-lms.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run build`: Builds the application for production.
- `npm run dev`: Starts the development server.
- `npm run lint`: Lints the code.
- `npm run start`: Starts the production server.
- `npm run seed`: Seeds the Firestore database.
- `npm run seed:dev`: An alias for `npm run seed`.
- `npm run seed:fresh`: Seeds the database with fresh data.

## Project Structure

- `app/`: Contains the pages and routes of the application.
- `components/`: Contains the reusable React components.
- `lib/`: Contains the utility functions and Firebase configuration.
- `public/`: Contains the static assets.
- `styles/`: Contains the global CSS styles.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.