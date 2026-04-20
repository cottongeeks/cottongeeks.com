# AGENTS.md

## Project Overview

This is **cottongeeks.com**, a static website/blog for Cottongeeks LLC consultancy built with Astro (latest version). The site features articles written in MDX with full React component support, Conway's Game of Life as homepage background.

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

- **Astro** - Static site generator with file-based routing
- **React** - For interactive components (selective hydration)
- **TypeScript** - With strict configuration
- **Tailwind CSS** - For styling
- **WebTUI** - For styling
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

### Interactive Features

- Conway's Game of Life homepage background (`game.ts`)
- React components within MDX content
- Social media embeds via astro-embed

## Development Notes

### Version Control

When developing locally, this repo uses Jujutsu (jj) as the version control system, on top of a colocated Git repo. If you are in a worktree, the colocated Git repo will be found in the default location indicated in .jj/repo 

Always attempt to use jj first, falling back to Git only if there are no traces of jj.

### Code comments

Whenever writing code, add terse comments around data structures to indicate what they are for. Whenever a piece of code has complicated or intricate logic, comment clearly to explain the behavior.

### Code changes

After every code change, make sure you format, lint and build the code.

### AWS

Use the aws CLI tool to check the resources in AWS and monitor logs. Ensure you are logged and if not prompt the user to login separately and return.

For logs, prefer `aws logs start-query` instead of `aws logs filter` because the former sometimes handles things like UUIDs better.

### Github Actions Convention

Keep workflow YAML files declarative. Do not inline multiline or complex bash in `run:` blocks — extract any non-trivial shell logic into a script under .github/scripts/ and call it from the workflow step.

### Adding Articles

1. Create MDX file in `src/content/articles/`
2. Include required frontmatter: `title`, `date`, `slug`
3. Use `draft: true` for unpublished articles
4. Articles auto-appear in `/articles` listing

### Style Development

- We are trying to emulate the look of a Terminal based application, using WebTUI
- Use context7 mcp to read Tailwind CSS 4 and WebTUI docs
- User webtui gitmcp server to read the code for the webtui website in the web/ subfolder
- NEVER use tailwind for padding and margin of text elements. Only use them for divs
- Use ch and lh for specifying padding and margin for text elements, and populate them in the articles.css file.

### Interactive Components

- React components in `src/components/`
- Import and use directly in MDX files
- Astro islands for selective hydration

### Build Process

- Static generation with pre-rendered HTML
- Custom build completion integration
- RSS feed generation during build

## Upgrading Astro

When upgrading Astro to a new version:

1. Read the official Astro blog post for the target version (usually included in the prompt) to understand new features, breaking changes, and migration steps.
2. Run the standard Astro upgrade command:

   ```bash
   npx @astrojs/upgrade
   ```

3. After the Astro upgrade, run `npx npm-package-update -u` to upgrade the rest of the dependencies as well.
4. Run `npm run build` to verify the upgrade was successful.
