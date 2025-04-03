# Selina's Personal Website

A modern, responsive personal website built with Next.js, showcasing projects, skills, and contact information. The website features a clean, professional design with a focus on user experience and performance.

## Features

- ⚡️ Optimized performance with Next.js and Turbopack
- 📱 Fully responsive design
- 🔍 SEO optimized with sitemap and robots.txt
- 🎯 Project showcase with GitHub integration
- 📊 Skills and experience display
- 📬 Contact form
- 🔒 Security headers and best practices

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chocoOnEstrogen/choco.rip.git
cd choco.rip
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
# Redis (optional, for caching)
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

# Discord (optional, for notifications)
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

<small>
    Or use the `env.sample` file to create your own.
</small>

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
my-website/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── configs/              # Configuration files
├── public/              # Static assets
├── scripts/             # Build and utility scripts
└── types/               # TypeScript type definitions
```

## Deployment

The website is configured for deployment on Vercel. To deploy:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
