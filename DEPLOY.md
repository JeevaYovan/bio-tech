# Deployment — Rathika Biotech Products → rathika.in

This site deploys to **GitHub Pages** at the custom apex domain
`rathika.in`. Hosting is free; the only recurring cost is the `.in`
domain renewal (~₹700–900/year).

## Architecture

```
push to main
   ↓
GitHub Actions (.github/workflows/deploy.yml)
   ↓
npm ci  →  npm run build  →  Lighthouse CI gate  →  upload artefact
   ↓
actions/deploy-pages@v4
   ↓
GitHub Pages CDN  ←  custom domain rathika.in (DNS A records)
```

No external runtime services. No SSR runtime. No cookies. No
third-party JavaScript at runtime.

---

## One-time setup (do these in order)

### 1. Klaro private registry credential (your machine)

`@klaro/ui`, `@klaro/utils`, and `@klaro/theme` come from a private
OneDev npm registry. Add the auth token to your **user-level** `.npmrc`
(not the project one):

```bash
# ~/.npmrc — never commit this file
@klaro:registry=https://development.zubera.one/klaro-design-ui/~npm/
//development.zubera.one/klaro-design-ui/~npm/:_authToken=<your-token>
```

Project `.npmrc` only points at the registry (no token):

```
@klaro:registry=https://development.zubera.one/klaro-design-ui/~npm/
```

For CI: add the token as a GitHub Actions secret (e.g.,
`KLARO_NPM_TOKEN`) and write `~/.npmrc` from the workflow.

### 2. GitHub repo + Pages settings

1. Push the project to `https://github.com/JeevaYovan/bio-tech.git` on
   the `main` branch.
2. Repo → **Settings** → **Pages**.
3. Under **Source**, select **GitHub Actions** (not the legacy "Deploy
   from a branch" option).
4. Leave **Custom domain** empty for now. We'll set it after the first
   successful deploy.

### 3. Buy `rathika.in`

Per the registrar research in Phase 1: register at **BigRock**
(₹700–900/year, India-based, INR-priced — no FX risk). Hostinger is an
acceptable alternative.

After purchase, **change the nameservers to Cloudflare** for free DNS,
faster propagation, and better SSL flexibility:

1. Sign up free at <https://dash.cloudflare.com>.
2. Add `rathika.in` as a site (free plan).
3. Cloudflare gives you 2 nameservers (e.g.,
   `nina.ns.cloudflare.com`, `chad.ns.cloudflare.com`).
4. At BigRock → My Domains → DNS → change nameservers to Cloudflare's.
   Propagation: typically minutes to a few hours.

### 4. DNS records (in Cloudflare)

Add these in Cloudflare → DNS → Records:

**A records for the apex:**

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | @ | 185.199.108.153 | **DNS only (grey cloud)** |
| A | @ | 185.199.109.153 | **DNS only (grey cloud)** |
| A | @ | 185.199.110.153 | **DNS only (grey cloud)** |
| A | @ | 185.199.111.153 | **DNS only (grey cloud)** |

**CNAME for the www subdomain:**

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | www | JeevaYovan.github.io | DNS only (grey cloud) |

> **Important:** keep all five records in **DNS only mode (grey
> cloud)** during the initial cert provisioning. GitHub Pages can't
> issue a Let's Encrypt cert if Cloudflare is proxying. Once the cert
> is green in repo Settings → Pages, you can flip the records to
> **Proxied (orange cloud)** for Cloudflare's edge cache and DDoS
> protection.

### 5. Wire the custom domain

After DNS has propagated (test with `dig +short rathika.in` — should
return the four GitHub IPs):

1. Repo → Settings → Pages.
2. Custom domain: `rathika.in`. Save.
3. Wait for the "DNS check successful" green tick (a few minutes).
4. Wait for the cert to provision (up to 24 hours, usually 30 min).
   You'll see "Your site is published at https://rathika.in" with a
   green padlock.
5. Tick **Enforce HTTPS**.

### 6. (Optional) Enable Cloudflare proxy

Once the cert is live and HTTPS is enforced, you can flip the DNS
records from grey cloud to orange. Benefits: edge caching, DDoS
protection, Cloudflare Analytics (privacy-respecting). Cloudflare
will issue its own edge cert; the GitHub Pages cert keeps providing
origin TLS.

### 7. Verify

```bash
curl -I https://rathika.in/                 # 200 + content-type: text/html
curl -I https://www.rathika.in/             # 301 → https://rathika.in/
curl -s https://rathika.in/sitemap.xml | head -3
curl -s https://rathika.in/robots.txt
```

---

## Subpath preview vs apex production

The deploy workflow supports two modes via the `DEPLOY_TARGET` repo
variable (Settings → Variables → Actions):

| `DEPLOY_TARGET` | URL | baseHref | CNAME | When |
|---|---|---|---|---|
| _unset_ or `subpath` | `https://JeevaYovan.github.io/bio-tech/` | `/bio-tech/` | omitted | **Default — preview before DNS** |
| `apex` | `https://rathika.in` | `/` | `rathika.in` | **After DNS resolves** |

Workflow:

1. **Right after first push (no DNS yet):** workflow builds with
   `--base-href=/bio-tech/` and strips the CNAME so GitHub Pages
   doesn't try to provision a cert for an unresolved domain. Site
   shows up at the subpath URL with all assets working.
2. **Once you've registered `rathika.in` and DNS is pointing at
   GitHub Pages** (DEPLOY.md §3-§4), set the repo variable
   `DEPLOY_TARGET = apex` (Settings → Variables → Actions →
   New repository variable). The next push (or a manual
   workflow_dispatch) rebuilds with `--base-href=/` + CNAME, and
   GitHub Pages will start serving at `https://rathika.in`.

You don't need to edit any code to switch — only the repo variable.

## Continuous deployment

The workflow at `.github/workflows/deploy.yml` (added in Phase 9) runs
on every push to `main`:

1. `npm ci` (uses the `KLARO_NPM_TOKEN` secret to write `~/.npmrc`)
2. `npm run build` — produces static HTML in `dist/rathika/browser/`
3. **Lighthouse CI** runs against the build using `lighthouserc.json`
   thresholds. Fails the workflow if PROMPT.md §1 hard targets
   regress.
4. `actions/deploy-pages@v4` uploads `dist/rathika/browser/` and
   publishes to Pages.
5. Workflow summary posts the deployment URL.

PR builds run the same workflow without the deploy step — useful as a
build + Lighthouse gate.

---

## Troubleshooting

### "Cert not provisioning, page shows HTTP error 522 / NET::ERR_CERT_AUTHORITY_INVALID"

Cloudflare is probably proxying the apex (orange cloud). Switch the
four A records to grey cloud, wait 5 minutes, then go to repo
Settings → Pages and click **Remove + re-add** the custom domain to
trigger a fresh cert request.

### "Refresh gives 404 on /products/some-slug"

The postbuild script copies `index.html` to `404.html` so GitHub Pages
falls back to the SPA on unknown routes. If that's missing, check the
build output:

```bash
ls dist/rathika/browser/404.html .nojekyll CNAME
```

Re-run `npm run build` if any are missing.

### "DNS isn't resolving after 24 hours"

```bash
dig +short rathika.in
dig +short www.rathika.in
```

If apex returns nothing, the four A records aren't applied or aren't
propagated. Check the Cloudflare DNS panel and confirm the records
match the table in step 4 exactly (no extra spaces, exact 4 IPs).

### "Lighthouse CI failing on Performance"

Lighthouse CI runs in a fresh GitHub-hosted runner with variable
resource availability. Scores can dip 5-10 points run-to-run on
mobile-throttled emulation. The `lighthouserc.json` thresholds are set
with that variability in mind. If a real regression happens (e.g., a
new dependency adds 50 KB), the assertion fails with a clear message
and you can fix or relax in the same PR.

### "Build fails: 401 Unauthorized on @klaro/ui"

The CI secret isn't being written to `~/.npmrc`. Check:

1. Repo → Settings → Secrets → `KLARO_NPM_TOKEN` exists
2. Workflow step writes it correctly (see deploy.yml)

### "Site loads but images 404"

Make sure `npm run images` was run before commit, and that
`public/assets/` is committed (not gitignored). Rebuild and check
`dist/rathika/browser/assets/` is populated.

---

## Costs

| Item | Cost | Notes |
|---|---|---|
| GitHub Pages hosting | ₹0 | Free for public repos |
| Domain (rathika.in) | ~₹700-900/yr | BigRock, paid annually |
| Cloudflare DNS + DDoS | ₹0 | Free plan |
| GitHub Actions minutes | ₹0 | Free tier covers this site easily |
| **Total recurring** | **~₹70/month** | Domain only |
