---
title: Pages System
description: Learn how to create and manage dynamic pages using both .page and .md file formats
category: features
order: 4
icon: fa-solid fa-file-code
---

## Overview

The Pages system allows you to create dynamic pages using either:
1. `.page` files with section-based content structure
2. `.md` files with standard Markdown syntax

Both formats support YAML frontmatter for configuration. Pages are stored in the application's data directory and are automatically rendered using their respective templates.

## File Formats

### 1. Markdown Format (.md)

Markdown files use standard GitHub Flavored Markdown syntax with additional features:
- Automatic heading IDs and anchor links
- Syntax highlighting for code blocks
- Tables, task lists, and other GFM features
- Sanitized HTML output for security

Example:
```markdown
---
title: About Us
description: Learn about our company
---

# Welcome to Our Company

## Our Mission 🚀
We strive to create amazing software that makes a difference.

### Technologies We Use
- Node.js
- TypeScript
- Express

```

### 2. Page Format (.page)

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

### Modal Section
Modals require three parts: ID, title, and content, separated by `|`:
```html
::modal
modal-id | Modal Title | <p>This is the modal content</p>
```

To trigger the modal, use a modal-button section:
```html
::modal-button
modal-id | Open Modal
```

Example with multiple modals:
```html
::modal
terms-modal | Terms of Service | 
<h3>Terms of Service</h3>
<p>Please read our terms carefully...</p>
|
::modal
privacy-modal | Privacy Policy | 
<h3>Privacy Policy</h3>
<p>Your privacy is important to us...</p>

::modal-button
terms-modal | Read Terms
|
::modal-button
privacy-modal | Read Privacy Policy
```

For Markdown files, you can use HTML directly:
```html
<div class="modal fade" id="my-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-glass">
            <div class="modal-header">
                <h5 class="modal-title">Modal Title</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                Modal content goes here...
            </div>
        </div>
    </div>
</div>

<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#my-modal">
    Open Modal
</button>
```

### Modal Styling
Modals use Bootstrap's modal system with additional glass-morphism styling:
```css
.modal-content.bg-glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Modal Best Practices
1. Use unique IDs for each modal
2. Keep modal content concise and focused
3. Include a clear close button
4. Consider using modals for:
   - Terms of service
   - Privacy policies
   - Image lightboxes
   - Quick forms
   - Additional information
5. Avoid nesting modals
6. Ensure modals are accessible with keyboard navigation

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

Pages can be created with either extension in the application's pages directory:
- `pages/about.md` → `/about`
- `pages/about.page` → `/about`
- `pages/products/index.md` → `/products`
- `pages/products/item.page` → `/products/item`

## Choosing Between Formats

Use `.md` when:
- Writing content-heavy pages
- Creating documentation
- Need standard Markdown features
- Want automatic table of contents
- Prefer writing in Markdown

Use `.page` when:
- Building landing pages
- Need complex layouts
- Using custom sections (hero, features, etc.)
- Want more control over HTML structure

## Best Practices

1. Choose the appropriate format for your content type
2. Use consistent formatting within each file type
3. Include proper SEO metadata in the frontmatter
4. For Markdown files:
   - Use headings hierarchically (h1 → h2 → h3)
   - Take advantage of automatic anchor links
   - Include code language for syntax highlighting
5. For Page files:
   - Use semantic HTML within sections
   - Leverage Bootstrap classes for layouts
   - Keep sections focused and concise
6. Organize files in logical directory structures