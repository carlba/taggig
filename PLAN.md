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
   	"assets": { "directory": "./dist" },
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

3. Add the custom domain (`taggig.dahleo.se`) with the paths as destinations. Add each path twice: with the wildcard and as an exact path, because `private/*` does not match `/private` without the trailing slash. See [Phase 8](#phase-8-cloudflare-access-setup-as-done) for the exact list.

4. Disable the workers.dev route and preview URLs for the Worker (Settings, then Domains & Routes). Do not use the "Add Workers" destination: it protects the whole Worker including the custom domain, which puts the entire public site behind the login.

5. Add an Allow policy for your email address (one-time PIN login is the simplest method).

6. Test in a private browser window: `/private/`, `/private` and `/private/private/` must ask for login, and the public pages must stay open.

Note: private pages are still built into `dist/` and served by Cloudflare with Access as the gate. This is fine for casual privacy but is not encryption.

## Phase 7: Keystatic on Cloudflare

Code is done: the Cloudflare adapter (prerendering in Node, since the OG image route needs `sharp`), Keystatic always enabled, and GitHub storage (`carlba/taggig`), see "Keystatic Configuration" below. Public and private pages are still prerendered static files in `dist/client`, and only the Keystatic admin and its API run as a Worker. Every save in the admin commits to GitHub, which triggers a rebuild.

1. Create the GitHub App by hand (the dev flow failed, see the notes below). Go to https://github.com/settings/apps/new and use:

   - Name: `taggig-cms`. GitHub reserves the names of deleted apps, so `taggig-keystatic` could not be reused after it was deleted by mistake.

   - Homepage URL: `https://github.com/carlba/taggig`.

   - Callback URLs: `https://taggig.dahleo.se/api/keystatic/github/oauth/callback` and `http://127.0.0.1:4321/api/keystatic/github/oauth/callback`.

   - Request user authorization (OAuth) during installation: on.

   - Webhook: off.

   - Repository permissions: Contents, Read and write.

   - Where can it be installed: only on this account.

   Then install it on `carlba/taggig` (the app's Install App page). The Client ID is on the app's General page (`Iv23liFb9VmKd9mTqzmJ`).

2. Generate a client secret on the app's **Credentials** page (https://github.com/settings/apps/taggig-cms/client_secrets), not on General. It is shown only once.

3. Add the variables in Cloudflare. There are two separate "Variables and secrets" sections on the Worker's Settings page, and each variable goes in one place only:

   - **Runtime** (the top section, "Variables and secrets"):

     - `KEYSTATIC_GITHUB_CLIENT_ID`: type Text, the Client ID.

     - `KEYSTATIC_GITHUB_CLIENT_SECRET`: type **Secret**, the client secret from step 2.

     - `KEYSTATIC_SECRET`: type **Secret**, a long random string such as the output of `openssl rand -hex 32`.

   - **Build** (Settings, then Build, then "Variables and secrets"):

     - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`: `taggig-cms`. It is read at build time, so trigger a new build after changing it.

   Dashboard runtime variables of type Text can be overwritten by a deploy when `wrangler.jsonc` does not list them. Secrets persist. Either list the non-secret values in `wrangler.jsonc` `vars` or re-check them after a deploy.

4. Protect the admin with Cloudflare Access, see [Phase 8](#phase-8-cloudflare-access-setup-as-done).

5. Check `/keystatic` on the deployed site: it must ask for the Access login first, then the GitHub login.

6. Make a test edit in Keystatic and confirm it commits and the site redeploys.

Notes:

- The build output is now `dist/client` (static) and `dist/server` (Worker). `wrangler deploy` finds it through the generated config, and pagefind runs against `dist/client`.

- `pnpm-workspace.yaml` allows the `workerd` install script.

- Cloudflare only allows variables on a Worker once it has been deployed with the adapter build. Before that it says "Variables cannot be added to a Worker that only has static assets".

- In dev, the Keystatic API routes (`/api/keystatic/*`) fail under the Cloudflare adapter with "exports is not defined" (the workerd runner cannot load the CommonJS Keystatic packages). Adding the packages to `vite.ssr.noExternal` did not help and was reverted. This is unresolved, and it is why the GitHub App is created by hand. The admin UI itself works with `local` storage in dev.

## Phase 8: Cloudflare Access Setup (as done)

What was set up in the dashboard, in order, for `taggig.dahleo.se`. Zero Trust is on the Free plan.

1. Zero Trust, then Access controls, then Applications, then Add an application, then Self-hosted and private.

2. Public hostnames, all on subdomain `taggig`, domain `dahleo.se`. Add one row per path:

   - `keystatic/*`

   - `keystatic`

   - `api/keystatic/*`

   - `private/*`

   - `private`

   The exact paths (`keystatic`, `private`) are needed because `keystatic/*` does not match `/keystatic` without the trailing slash. That was found by testing: `/keystatic/` redirected to the login but `/keystatic` returned 200.

3. Policy: create a new policy named "Owner only", action Allow, rule Include, selector Emails, value the owner's email address.

4. Leave the identity providers on "Accept all available identity providers" (one-time PIN). Application name `taggig`, session duration 24 hours. Click Create.

5. Do not add a Workers destination. The first attempt included the `taggig` Worker ("A Worker's production and preview URLs"), and the whole site, including the public pages, then required login. It was removed. To close the workers.dev hostname instead, disable the workers.dev route and preview URLs on the Worker (Settings, then Domains & Routes).

6. Verify from a terminal. Everything under the protected paths should answer with a 302 to `*.cloudflareaccess.com`, and the home page should answer 200:

   ```sh
   for p in "" keystatic keystatic/ private private/ api/keystatic/github/login; do
     echo "/$p: $(curl -s -o /dev/null -w '%{http_code}' https://taggig.dahleo.se/$p)"
   done
   ```

Status when this was written: the exact-path rows (`keystatic`, `private`) were added and Save was clicked, but the curl check above had not been run yet. Run it to confirm. The GitHub App client secret, `KEYSTATIC_SECRET`, the updated Client ID and slug in Cloudflare, and a rebuild were also still pending.

## Open Questions

- Should the workers.dev route and preview URLs be disabled (so the admin and private posts are not reachable there)?

- Should the non-secret Keystatic variables be moved into `wrangler.jsonc` `vars`?

- Any branding assets (logo, colors, fonts) ready, or should we keep the defaults for now?

## Notes

- The commands and file paths above are based on the upstream theme's layout and should be checked against the scaffolded version, since the theme changes between releases.
