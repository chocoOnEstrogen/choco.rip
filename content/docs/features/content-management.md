---
title: Content Management
description: Learn how to manage blog posts, documentation, and other content
category: features
order: 2
---

## Overview

The content management system handles blog posts, documentation, and static content using Markdown files with YAML frontmatter.

## Content Types

### Blog Posts
Located in `content/blog/YYYY/MM/DD/slug.md`:

```markdown
---
title: "Post Title"
excerpt: "Brief description"
author: "username"
tags: ["tag1", "tag2"]
status: "published"
featured: true
coverImage: "path/to/image.jpg"
---

Post content here...
```

### Documentation Pages
Located in `content/docs/category/slug.md`:

```markdown
---
title: "Doc Title"
description: "Page description"
category: "category-name"
order: 1
---

Documentation content...
```

## Content Utilities

The `createContent()` function in [`src/utils/content.ts`](https://github.com/chocoOnEstrogen/choco.rip/blob/master/src/utils/content.ts) provides content management features:

```typescript
const content = createContent('content', {
  markdown: {
    gfm: true,
    highlight: true
  }
})
```

## File Structure

```
content/
├── blog/
│   └── YYYY/
│       └── MM/
│           └── DD/
│               └── post-slug.md
├── docs/
│   └── category/
│       └── page-slug.md
└── about.md
```

## Content API

### Fetching Content

```typescript
// Get all blog posts
const posts = await getAllPosts()

// Get single post
const post = await getPost(year, month, day, slug)

// Get documentation
const doc = await getDocContent(category, slug)
```

## Frontmatter Schema

The system validates frontmatter using defined schemas:

```typescript
interface BlogFrontmatter {
  title: string
  excerpt: string
  author: string
  tags: string[]
  status: 'draft' | 'published'
  featured?: boolean
  coverImage?: string
}
``` 