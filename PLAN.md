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

Target host: Cloudflare Workers with static assets (free tier, global CDN). Cloudflare's current flow for static sites; the older Pages product is in maintenance mode.

1. Add a `wrangler.jsonc` to the repo root:

   ```jsonc
   {
     "name": "taggig",
     "compatibility_date": "2026-10-29",
     "assets": { "directory": "./dist" }
   }
   ```

   The `name` must match the Worker name chosen in the dashboard.

2. Push the repo to a git remote (GitHub or GitLab) so Cloudflare can connect to it. Create the remote repo empty (no README or .gitignore).

3. In the Cloudflare dashboard, go to Workers & Pages, then Create application, then import the existing Git repository (not a template).

4. Configure the build:

   - Build command: `pnpm build`.

   - Deploy command: `npx wrangler deploy` (the default).

   - Preview command: `npx wrangler preview` is the default; leave it unless branch previews misbehave.

   - Environment variable: `NODE_VERSION` set to the Node version used locally, if the default build image differs.

5. Deploy, then open the generated `*.workers.dev` URL and check the site.

6. Add the custom domain under the Worker's Settings, then Domains & Routes. If the domain's DNS is not on Cloudflare, add the record Cloudflare shows. Confirm HTTPS is active.

7. Set `site` in `astro.config.ts` to the final custom domain, commit, and let it redeploy so the sitemap, RSS and canonical links are correct.

8. Confirm that pushes to the production branch deploy automatically and that other branches get preview URLs.

Fallback: classic Cloudflare Pages (Astro preset, output directory `dist`, no deploy command) works too if the Workers flow causes problems.

## Phase 6: Private Posts

Private posts live in `content/private/` (the `private` collection) and are served under `/private/`. The site code is done: they are left out of the home page, tags, RSS, sitemap, search index and og-image generation, and the pages carry `noindex, nofollow`. The access control itself is Cloudflare Access and must be set up in the dashboard.

1. Make sure the git repo is private, since the post sources are in it.

2. In the Cloudflare dashboard, go to Zero Trust, then Access, then Applications, then Add an application, then Self-hosted.

3. Add the custom domain with path `private/*` as the application destination.

4. Add the `*.workers.dev` hostname with path `private/*` too, or disable the workers.dev route for the Worker. Otherwise the private posts are reachable without login on that hostname.

5. Add an Allow policy for your email address (one-time PIN login is the simplest method).

6. Test in a private browser window: `/private/` and `/private/private/` must ask for login, and the public pages must stay open.

Note: private pages are still built into `dist/` and served by Cloudflare with Access as the gate. This is fine for casual privacy but is not encryption.

## Open Questions

- What is the production domain?

- Is a git remote already planned (GitHub, etc.)?

- Any branding assets (logo, colors, fonts) ready, or should we keep the defaults for now?

## Notes

- The commands and file paths above are based on the upstream theme's layout and should be checked against the scaffolded version, since the theme changes between releases.
