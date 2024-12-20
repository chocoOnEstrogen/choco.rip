<div align="center">
  <h1>choco.rip</h1>
  <p>A personal website for Stella</p>

  [![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
</div>

## ✨ Features

- 📝 **Content Management System** - Markdown-based content with YAML frontmatter
- 🛣️ **Modular Routing** - Express.js with organized feature-based routing
- 🔒 **Authentication** - Built-in user authentication and authorization
- 📊 **Admin Dashboard** - Comprehensive admin interface
- 🎨 **Templating** - EJS templating with layouts
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **SEO Optimized** - Built-in SEO best practices
- 🚀 **Performance** - Caching and optimization strategies

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chocoOnEstrogen/choco.rip.git
cd choco.rip
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:9000` to see your application running.

## 📁 Project Structure

```
├── content/              # Content files (blog posts, docs)
│   ├── blog/            # Blog posts
│   └── docs/            # Documentation
├── src/
│   ├── routes/          # Application routes
│   ├── utils/           # Utility functions
│   └── views/           # EJS templates
├── public/              # Static assets
└── docs/                # Project documentation
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run format` - Format code with Prettier
- `npm run edit-config` - Edit configuration
- `npm run tsc` - Run TypeScript compiler
- `npm run commit` - Run commit helper script
- `npm run copy` - Copy static assets
- `npm run pm2:start` - Start application with PM2
- `npm run pm2:stop` - Stop PM2 processes
- `npm run pm2:restart` - Restart PM2 processes
- `npm run pm2:delete` - Delete PM2 processes
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monitor` - Monitor PM2 processes
- `npm run setup-config` - Set up initial configuration
- `npm run setup-data` - Set up initial data
- `npm run postinstall` - Run post-installation setup

### Content Management

Create new content in Markdown with YAML frontmatter:

```markdown
---
title: "Your Title"
description: "Page description"
category: "category-name"
order: 1
---

Your content here...
```

## 📚 Documentation

Comprehensive documentation is available in the `docs` directory:

- [Installation Guide](content/docs/getting-started/installation.md)
- [Content Management](content/docs/features/content-management.md)
- [Routing System](content/docs/features/routing.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for database
- TypeScript for type safety
- All our amazing contributors

## 📞 Support

- Create an issue for bug reports
- Join our [Discord community](https://discord.gg/x8A89TVJUv)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/chocoOnEstrogen">chocoOnEstrogen</a>
</div>



