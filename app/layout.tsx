import type React from "react"
import "@/app/globals.css"
import { Space_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
})

export const metadata = {
  title: "Promraw - AI-Generated NFT Platform",
  description: "Create artwork based on AI-generated prompts, get scored by AI, and mint your creations as NFTs.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceMono.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'