---
title: Installation Guide
description: How to install and set up the project
category: getting-started
order: 1
icon: fa-solid fa-download
---

## Prerequisites

Before installing the project, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

## Quick Start

1. Clone the repository: 

```bash
git clone https://github.com/chocoOnEstrogen/choco.rip.git
cd choco.rip
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables:

```dotenv
GITHUB_TOKEN=<your-github-token>
GITHUB_USERNAME=<your-github-username>
MONGO_URI=<your-mongo-uri>
ADMIN_PASSWORD=<your-actual-secure-password>
SESSION_TOKEN=<your-actual-secure-token>
BLUESKY_IDENTIFIER=<your-bluesky-identifier>
BLUESKY_PASSWORD=<your-bluesky-password>
BLOG_MEDIA=<your-blog-media-directory>
HOST=<your-host>
PORT=<your-port>
GITHUB_WEBHOOK_SECRET=<your-github-webhook-secret>
```

5. Start development server:

```bash
npm run dev
```

6. Access the application at `http://localhost:{PORT,9000}`.

## Production Deployment

For production deployment:

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

3. Access the application at `http://localhost:{PORT,9000}`.

## Troubleshooting

Common installation issues and solutions:

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Ensure MongoDB is running
2. Check your connection string
3. Verify network connectivity
4. Check MongoDB user permissions

### Node Version Conflicts

If you encounter Node.js version conflicts:

1. Use nvm to manage Node versions
2. Run `nvm use` to switch to the correct version
3. Clear npm cache if needed: `npm cache clean -f`