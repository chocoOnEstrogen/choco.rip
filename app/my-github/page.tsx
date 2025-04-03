import { Metadata } from "next"
import { getGithubUser, getUserEvents, GithubUser, GithubEvent } from "@/lib/github"
import config from "@/config"
import MyGithub from "@/components/my-github"

export const metadata: Metadata = {
  title: "My GitHub Info - Find Your GitHub ID",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: "Find your GitHub user ID and view your GitHub profile information. Useful for contributing to VTubers.TV translations.",
  keywords: "github id, github user id, github profile, vtubers.tv, translations",
  openGraph: {
    title: "My GitHub Info - Find Your GitHub ID",
    description: "Find your GitHub user ID and view your GitHub profile information. Useful for contributing to VTubers.TV translations.",
    type: "website",
    url: config.url + "/my-github",
    images: [
      {
        url: config.url + "/images/bg.gif",
        width: 1200,
        height: 630,
        alt: "GitHub Info",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My GitHub Info - Find Your GitHub ID",
    description: "Find your GitHub user ID and view your GitHub profile information. Useful for contributing to VTubers.TV translations.",
    images: [config.url + "/images/bg.gif"],
  },
  alternates: {
    canonical: config.url + "/my-github",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default async function MyGithubPage() {
  return <MyGithub />
}
