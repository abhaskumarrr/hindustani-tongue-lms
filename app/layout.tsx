import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hindustani Tongue LMS - Learn Indian Languages",
  description:
    "Master Hindi, Urdu, Bengali, Punjabi and other Indian languages with our comprehensive learning management system designed for heritage learners and the diaspora community.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://www.youtube.com/iframe_api" async></script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SiteHeader />
            <Suspense fallback={null}>
              {children}
              <Analytics />
            </Suspense>
            <SiteFooter />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
