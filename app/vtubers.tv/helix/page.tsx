import { Metadata } from "next"
import HelixDemo from "@/components/helix-demo"
import config from "@/config"

export const metadata: Metadata = {
  title: "Helix ID Generator",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: "Generate and decode unique IDs and tokens using the Helix algorithm.",
  keywords: "helix, id generator, unique id, token generator, vtubers.tv",
  openGraph: {
    title: "Helix ID Generator",
    description: "Generate and decode unique IDs and tokens using the Helix algorithm.",
    type: "website",
    url: config.url + "/helix",
    images: [
      {
        url: config.url + "/images/bg.gif",
        width: 1200,
        height: 630,
        alt: "Helix ID Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helix ID Generator",
    description: "Generate and decode unique IDs and tokens using the Helix algorithm.",
    images: [config.url + "/images/bg.gif"],
  },
  alternates: {
    canonical: config.url + "/helix",
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

export default function HelixPage() {
  return <HelixDemo />
} 