# AGENTS.md

## Upgrading Astro

When upgrading Astro to a new version:

1. Read the official Astro blog post for the target version (e.g. https://astro.build/blog/astro-610/ for 6.1) to understand new features, breaking changes, and migration steps.
2. Run the standard Astro upgrade command:
   ```bash
   npx @astrojs/upgrade
   ```
3. After the Astro upgrade, run `npx npm-package-update -u` to upgrade the rest of the dependencies as well.
4. Run `npm run build` to verify the upgrade was successful.
