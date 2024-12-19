---
title: Routing System
description: Understanding the application's routing architecture
category: features
order: 3
icon: fa-solid fa-route
---

## Overview

The application uses Express.js for routing, with a modular structure organized by feature domains.

## Route Structure

### Main Routes
- [`src/routes/main.ts`](https://github.com/chocoOnEstrogen/choco.rip/blob/master/src/routes/main.ts): Core application routes
- [`src/routes/admin.ts`](https://github.com/chocoOnEstrogen/choco.rip/blob/master/src/routes/admin.ts): Admin panel routes
- [`src/routes/blog.ts`](https://github.com/chocoOnEstrogen/choco.rip/blob/master/src/routes/blog.ts): Blog functionality
- [`src/routes/cache.ts`](https://github.com/chocoOnEstrogen/choco.rip/blob/master/src/routes/cache.ts): Cache management

## Route Implementation

### Basic Route Setup

```typescript data-filename="src/routes/main.ts"
import { Router } from 'express'
const router = Router()

router.get('/', async (req, res) => {
  render(req, res, 'index', {
    title: 'Home'
  })
})
```

### Protected Routes

```typescript data-filename="src/routes/main.ts"
router.get('/admin/*', requireAuth, async (req, res) => {
  // Protected route handler
})
```

## Middleware Integration

### Common Middleware

```typescript data-filename="src/routes/main.ts"
app.use(checkBlocklist)
app.use(requestLogger)
app.use(express.json())
app.use(cookieParser())
```

## Route Parameters

### Dynamic Routes

```typescript data-filename="src/routes/main.ts"
router.get('/blog/:year/:month/:day/:slug', async (req, res) => {
  const { year, month, day, slug } = req.params
  const post = await getPost(year, month, day, slug)
  // Handler logic
})
```

## Error Handling

The routing system includes centralized error handling:

```typescript data-filename="src/routes/main.ts"
app.use((err, req, res, next) => {
  error(req, res, err, err.status || 500)
})
```

## View Rendering

Routes use the `render` utility for consistent view rendering:

```typescript data-filename="src/routes/main.ts"
render(req, res, 'template', {
  title: 'Page Title',
  data: someData
})
``` 