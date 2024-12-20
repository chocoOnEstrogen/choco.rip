---
title: Pages System
description: Learn how to create and manage dynamic pages using the .page file format
category: features
order: 4
icon: fa-solid fa-file-code
---

## Overview

The Pages system allows you to create dynamic pages using a simple file format with YAML frontmatter and section-based content structure. Pages are stored in the application's data directory and are automatically rendered using predefined section templates.

## File Format

A `.page` file consists of two main parts:
1. YAML frontmatter (configuration)
2. Section-based content

Example:
```html
---
title: Enhanced Page Example
seo:
  title: Enhanced Page Example
  description: Showcasing all available page sections
---

::hero
<h1 class="display-3 mb-4">Welcome to Our Platform</h1>
<p class="lead mb-4">Discover the power of our enhanced page builder</p>
<a href="#features" class="btn btn-gradient">Explore Features</a>

::features
<div class="text-center">
    <i class="fas fa-rocket fa-3x mb-3 text-primary"></i>
    <h3>Lightning Fast</h3>
    <p>Optimized for maximum performance</p>
</div>
|
<div class="text-center">
    <i class="fas fa-shield-alt fa-3x mb-3 text-primary"></i>
    <h3>Secure</h3>
    <p>Built with security in mind</p>
</div>
```

## Available Sections

### Hero Section
```html
::hero
<h1>Main Title</h1>
<p>Subtitle text</p>
<a href="#" class="btn">Call to Action</a>
```

### Features Section
Uses a grid layout with `|` separator between features:
```html
::features
<div class="text-center">
    <i class="fas fa-icon"></i>
    <h3>Feature 1</h3>
    <p>Description</p>
</div>
|
<div class="text-center">
    <i class="fas fa-icon"></i>
    <h3>Feature 2</h3>
    <p>Description</p>
</div>
```

### Gallery Section
Grid of images separated by `|`:
```html
::gallery
<img src="/image1.jpg" alt="Image 1" class="img-fluid">
|
<img src="/image2.jpg" alt="Image 2" class="img-fluid">
```

### Testimonials Section
Customer testimonials with profile images:
```html
::testimonials
<div class="text-center">
    <img src="/avatar1.jpg" alt="User 1" class="rounded-circle">
    <p>"Testimonial text"</p>
    <h5>Name</h5>
    <p class="text-muted">Position</p>
</div>
|
<div class="text-center">
    <img src="/avatar2.jpg" alt="User 2" class="rounded-circle">
    <p>"Another testimonial"</p>
    <h5>Name</h5>
    <p class="text-muted">Position</p>
</div>
```

### Stats Section
Display statistics in a grid:
```html
::stats
<h2 class="display-4">1M+</h2>
<p class="text-muted">Users</p>
|
<h2 class="display-4">50K+</h2>
<p class="text-muted">Downloads</p>
```

### FAQ Section
Accordion-style frequently asked questions:
```html
::faq
<div class="accordion-header">
    <button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#faq1">
        Question 1?
    </button>
    <div id="faq1" class="accordion-collapse collapse show">
        <div class="accordion-body">
            Answer 1
        </div>
    </div>
</div>
|
<div class="accordion-header">
    <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#faq2">
        Question 2?
    </button>
    <div id="faq2" class="accordion-collapse collapse">
        <div class="accordion-body">
            Answer 2
        </div>
    </div>
</div>
```

### CTA (Call to Action) Section
```html
::cta
<h2 class="display-4">Ready to Get Started?</h2>
<p class="lead">Join thousands of satisfied customers today</p>
<a href="/signup" class="btn btn-lg">Sign Up Now</a>
```

## Configuration Options

The YAML frontmatter supports the following options:

```yml
title: Page Title
seo:
  title: SEO Title
  description: SEO Description
css: 
  - /custom.css
js:
  - /custom.js
```

## File Location

Pages should be stored in the application's pages directory, which is automatically created at:
- Windows: `%APPDATA%\{APP_NAME}\pages`
- macOS: `~/Library/Application Support/{APP_NAME}/pages`
- Linux: `~/.config/{APP_NAME}/pages`

## URL Routing

Pages are automatically routed based on their file location:
- `pages/about.page` → `/about`
- `pages/products/index.page` → `/products`
- `pages/products/item.page` → `/products/item`

## Best Practices

1. Use semantic HTML within sections
2. Leverage Bootstrap classes for responsive layouts
3. Keep sections focused and concise
4. Use appropriate section types for content
5. Include proper SEO metadata in the frontmatter
6. Organize pages in logical directory structures 