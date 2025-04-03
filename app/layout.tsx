import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import config from "@/config";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner"
import { Heart } from "lucide-react";
import Header from "@/components/header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: {
    default: `${config.name} | Full Stack Developer & Open Source Enthusiast`,
    template: `%s | ${config.name}`,
  },
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: `${config.name} is a Full Stack Developer and Open Source Enthusiast based in ${config.location}. Specializing in modern web development and creating impactful open source projects.`,
  keywords: ['Full Stack Developer', 'Open Source', 'Web Development', 'Software Engineer', 'GitHub', config.location || ''],
  authors: [{ name: config.name }],
  creator: config.name,
  publisher: config.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: config.url,
    siteName: config.name,
    title: `${config.name} | Full Stack Developer & Open Source Enthusiast`,
    description: `${config.name} is a Full Stack Developer and Open Source Enthusiast based in ${config.location}. Specializing in modern web development and creating impactful open source projects.`,
    images: [
      {
        url: config.avatar,
        width: 800,
        height: 600,
        alt: config.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${config.name} | Full Stack Developer & Open Source Enthusiast`,
    description: `${config.name} is a Full Stack Developer and Open Source Enthusiast based in ${config.location}. Specializing in modern web development and creating impactful open source projects.`,
    images: [config.avatar],
    creator: '@chocoOnEstrogen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: config.url,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="relative min-h-screen bg-background">
            <Header />
            <main className="relative">
              {children}
            </main>

            <Toaster />

            <footer className="py-8 md:py-12 bg-pink-50/50 dark:bg-pink-950/20">
              <div className="container px-4 md:px-6">
                <div className="mt-8 pt-8 border-t border-pink-200 dark:border-pink-900 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {config.name}. All rights reserved.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Badge variant="outline" className="rounded-full text-xs px-3 py-1 border-pink-200 dark:border-pink-800">
                      Made with <Heart className="inline-block w-3 h-3 mx-0.5 text-pink-500" />
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-xs px-3 py-1 border-pink-200 dark:border-pink-800">
                      Powered by Next.js & Tailwind CSS
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-xs px-3 py-1 border-pink-200 dark:border-pink-800">
                      <Link href={`${config.github}/choco.rip`} className="text-pink-500 hover:text-pink-600 transition-colors">
                        Open Sourced on GitHub
                      </Link>
                    </Badge>
                  </div>
                </div>
              </div>
            </footer>
          </div>
      </body>
    </html>
  );
}
