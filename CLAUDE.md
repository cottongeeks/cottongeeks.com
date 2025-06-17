# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Cottongeeks.com**, a static website/blog for Cottongeeks LLC consultancy built with Astro 5.9.4. The site features articles written in MDX with full React component support, Conway's Game of Life as homepage background, and dark/light theme switching.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run fmt

# Check formatting
npm run fmt:check
```

## Architecture

### Tech Stack
- **Astro 5.9.4** - Static site generator with file-based routing
- **React 19.1.0** - For interactive components (selective hydration)
- **TypeScript** - With strict configuration
- **Tailwind CSS 4.1.10** - For styling with Typography plugin
- **MDX** - For content with React component support
- **KaTeX** - For mathematical expressions

### Key Directories
- `src/pages/` - Astro pages and routing (index, articles, dynamic routes)
- `src/content/` - Content collections with schema (`content.config.ts`)
- `src/layouts/` - Reusable layouts (`ArticleLayout.astro`)
- `src/components/` - React components for interactive elements
- `src/styles/` - CSS files for pages
- `src/integrations/` - Custom Astro integrations

### Content System
- **Content Collections**: Type-safe content management with schema validation
- **Article Schema**: `{ title, date, slug, draft }` structure
- **URL Pattern**: `/articles/YYYY-MM-DD-slug` format
- **MDX Support**: Full React component imports in articles
- **RSS Feed**: Auto-generated at `/rss.xml`

### Theme System
- Dark/light mode toggle with localStorage persistence
- CSS custom properties for theme switching
- Implemented in `ArticleLayout.astro:108-130`

### Interactive Features
- Conway's Game of Life homepage background (`game.ts`)
- React components within MDX content
- Social media embeds via astro-embed

## Development Notes

### Adding Articles
1. Create MDX file in `src/content/articles/`
2. Include required frontmatter: `title`, `date`, `slug`
3. Use `draft: true` for unpublished articles
4. Articles auto-appear in `/articles` listing

### Theme Development
- Theme toggle logic in `ArticleLayout.astro`
- CSS variables defined for both themes
- Tailwind classes use theme-aware colors

### Interactive Components
- React components in `src/components/`
- Import and use directly in MDX files
- Astro islands for selective hydration

### Build Process
- Static generation with pre-rendered HTML
- Custom build completion integration
- RSS feed generation during build