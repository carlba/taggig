# Taggig: Astro Cactus Setup Plan

Plan for setting up the [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) theme in this repo.

## Goals

- A working Astro Cactus site running locally.

- Site identity (title, author, description, URLs) customized for Taggig.

- Demo content replaced with our own.

- A deployment target chosen and wired up.

## Prerequisites

- Node.js (a current LTS release; check the theme's `package.json` `engines` field).

- pnpm (the theme's documented package manager).

- The repo is currently empty and not a git repository, so run `git init` first.

## Phase 1: Scaffold

1. Run `git init` in the repo root.

2. Scaffold the theme into the current directory:

   ```sh
   pnpm create astro@latest -- --template chrismwilliams/astro-theme-cactus
   ```

   Choose `.` as the target directory. If the CLI refuses because the directory is not empty, scaffold into a temp directory and move the files in (keeping this README's plan content).

3. Install dependencies with `pnpm install` if the scaffolder did not.

4. Start the dev server with `pnpm dev` and confirm the demo site loads at `http://localhost:4321`.

5. Make the first commit so later changes are easy to diff against the stock theme.

## Phase 2: Configure

1. Edit `src/site.config.ts`: site title, author, description, language, date format, and the menu links.

2. Edit `astro.config.ts`: set `site` to the final production URL (needed for the sitemap, RSS and canonical links).

3. Replace the favicon and social image in `public/` and update `src/components/` references if filenames change.

4. Update `package.json` (`name`, `description`) and the license/attribution as appropriate.

5. Review the theme's color and font settings (Tailwind config and the global CSS) and adjust to the Taggig brand.

## Phase 3: Content

1. Delete the demo posts, notes and tags under `src/content/`.

2. Update the content collection schema in `src/content.config.ts` only if we need extra frontmatter fields.

3. Rewrite the About page (`src/pages/about`).

4. Add a first real post and confirm it renders, appears on the home page, and shows up in RSS.

## Phase 4: Verify

- Run `pnpm build` and `pnpm preview` and check the production output.

- Run the theme's lint/format/type-check scripts (see `package.json`) and fix any failures.

- Check light and dark mode, mobile layout, search (if enabled in the theme version), RSS and sitemap.

## Phase 5: Deploy

Pick one host (open question below), then:

1. Connect the repo to the host.

2. Set the build command to `pnpm build` and the output directory to `dist`.

3. Set the production URL to match `site` in `astro.config.ts`.

4. Add the custom domain and confirm HTTPS.

## Open Questions

- Where do we want to host (Netlify, Vercel, Cloudflare Pages, GitHub Pages)?

- What is the production domain?

- Is a git remote already planned (GitHub, etc.)?

- Any branding assets (logo, colors, fonts) ready, or should we keep the defaults for now?

## Notes

- The commands and file paths above are based on the upstream theme's layout and should be checked against the scaffolded version, since the theme changes between releases.
