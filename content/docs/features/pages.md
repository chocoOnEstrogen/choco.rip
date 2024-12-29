---
title: Dynamic Pages
description: Create dynamic pages using variables, functions, and sections
category: features
order: 4
icon: fa-solid fa-file-code
---

# Dynamic Pages

Create interactive pages using variables, functions, and structured sections. The system supports two file formats:
- `.page` - For dynamic content with sections and functions
- `.md` - For standard Markdown content

## Quick Start

### Basic Page Structure
```page
---
title: My Page
seo:
  title: SEO Title
  description: SEO Description
---

$count = length "item1,item2,item3"
$date = formatDate "2024-03-20"

::content
<h1>Welcome</h1>
<p>We have {{ $count }} items as of {{ $date }}</p>
```

## Variables

### Config Variables
Access global configuration:
```
{{ @site.title }}
{{ @theme.colors.primary }}
```

### Page Variables
Define and use variables within a page:
```
$name = John Doe
$items = readDir "content/images"
$count = length $items

Hello {{ $name }}! We found {{ $count }} images.
```

## Functions

### File Operations
```
# Read file contents
$content = readFile "path/to/file.txt"

# List directory contents
$images = readDir "content/images"
```

### Content Processing
```
# Format dates
$date = formatDate "2024-03-20" "en-US"

# Generate table of contents
$toc = tableOfContents $content

# Get last modified date
$modified = getGitLastModified "path/to/file"
```

### Loops and Arrays
```
# Basic loop with counter
{{ for "1" "5" "<li>Item $i</li>" }}

# Loop through array
$items = split "apple,banana,orange"
{{ forEach $items '<div class="fruit">$item</div>' }}

# Repeat content
{{ repeat "3" "<div>Repeated</div>" }}
```

### Text Functions
```
# Transform text
$title = capitalize "hello world"
$slug = slugify "Hello World!"

# Math operations
$result = math "2 + 2 * 3"
```

## Sections

### Content Section
Basic content with HTML:
```
::content
<div class="container">
  <h1>Title</h1>
  <p>Content goes here...</p>
</div>
```

### Grid Section
Create responsive layouts:
```
::grid cols-3
<div>Column 1</div>
|
<div>Column 2</div>
|
<div>Column 3</div>
```

### Gallery Section
Display image galleries:
```
$images = readDir "content/gallery"

::gallery
{{ forEach $images '<img src="/gallery/$item" alt="$item">' }}
```

### Modal Section
Create popups:
```
::modal
login-modal | Login | 
<form>
  <input type="email" placeholder="Email">
  <button type="submit">Login</button>
</form>

::modal-button
login-modal | Open Login
```

## Best Practices

1. **Variable Naming**
   - Use descriptive names: `$userCount` instead of `$c`
   - Keep names short but meaningful

2. **Function Usage**
   - Handle errors gracefully
   - Chain functions when needed: `$slug = slugify capitalize $title`

3. **Section Organization**
   - Group related sections together
   - Use comments to separate major sections
   - Keep section content focused

4. **Performance**
   - Minimize file operations
   - Use caching when possible
   - Optimize image sizes for galleries

## Examples

### Dynamic Gallery
```page
---
title: Image Gallery
---
$images = readDir "content/gallery"
$count = length $images
$lastUpdate = getGitLastModified "content/gallery"

::content
<h1>Gallery ({{ $count }} images)</h1>
<p>Last updated: {{ $lastUpdate }}</p>

::grid cols-3
{{ forEach $images '<div class="card">
  <img src="/gallery/$item" alt="$item">
  <div class="card-body">
    <h5>{{ capitalize $item }}</h5>
    <a href="/gallery/$item" download>Download</a>
  </div>
</div>' }}
```

### FAQ Page
```page
---
title: FAQ
---
$questions = split "What is it?,How does it work?,Why use it?"
$answers = split "It's a tool,Like magic,Because it's awesome"

::faq
{{ forEach $questions '<div class="accordion-item">
  <h2 class="accordion-header">$item</h2>
  <div class="accordion-body">$answers</div>
</div>' }}
```

## Troubleshooting

Common issues and solutions:

1. **Variables Not Resolving**
   - Check variable name case sensitivity
   - Verify variable is defined before use
   - Look for typos in variable names

2. **Functions Not Working**
   - Ensure correct argument format
   - Check file paths are correct
   - Verify function exists in pageFunctions

3. **Sections Not Rendering**
   - Confirm section type is valid
   - Check HTML syntax
   - Verify section separator (::) is at start of line