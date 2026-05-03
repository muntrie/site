# Muntrie Public Legal Pages

`site/` contains Muntrie's current public static pages. Its main purpose is to provide publicly accessible privacy policy, terms, and support pages for Google Play, App Store review, users, and reviewers before a full official website is available.

The directory is organized as a pure static site and can be published directly through GitHub Pages or another static hosting service. It does not depend on Flutter, Node, SSR, a CMS, or any additional build pipeline.

## Current Purpose

- Provide a public privacy policy URL for Google Play Console
- Provide terms and support entry points for App Store Connect, reviewers, and users
- Keep a stable, low-maintenance compliance page set before the official website is launched
- Keep app legal text, support copy, and public web copy in the same repository to reduce version drift

## Public Pages

- `privacy.html`: Privacy Policy page, intended as the primary Privacy Policy URL for Google Play
- `terms.html`: Terms of Use page
- `support.html`: User support, billing, privacy, safety, and legal contact entry point
- `about.html`: Product and operator information page
- `index.html`: Lightweight public entry page for Muntrie

## Google Play URL

If this directory is deployed through GitHub Pages, the Privacy Policy field in Google Play Console should use the full deployed URL for `privacy.html`, for example:

```text
https://<github-user-or-org>.github.io/<repo-name>/privacy.html
```

If GitHub Pages is configured to publish the `site/` directory as the publishing source, the page URL will usually be:

```text
https://<github-user-or-org>.github.io/<repo-name>/privacy.html
```

If GitHub Pages is configured to publish from the repository root and `site/` is exposed as a subdirectory, the page URL will usually be:

```text
https://<github-user-or-org>.github.io/<repo-name>/site/privacy.html
```

Before submitting the URL to Google Play, open the final URL in a browser environment that is not logged in and not connected to any private network. Confirm that the page loads directly without authentication, redirect errors, or a 404.

## Pre-Launch Checks

- `site/config.js`: Support email, privacy email, company or operator name, and iOS / Android download links
- `site/content.js`: English and Chinese copy for the Privacy Policy, Terms of Use, support page, and home page
- `site/privacy.html`: Privacy Policy page shell and SEO fallback
- `site/terms.html`: Terms of Use page shell and SEO fallback
- `site/support.html`: User support and public contact entry point

If Google Play only needs the Privacy Policy URL, the minimum check scope is:

- `privacy.html` is publicly accessible
- The page title, product name, and contact email are correct
- The privacy policy covers the app's current data handling, analytics, diagnostics, purchases, and third-party services
- The page does not require login, does not depend on a dynamic API, and does not return 404

## Local Preview

Run this from the repository root:

```bash
cd site
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/privacy.html
```

## Maintenance Principles

- Keep the privacy policy, terms, and support entry point stable and accessible before expanding the site into a full official website
- Keep public legal and support copy aligned with the text shown inside the app
- Placeholder store links, QR codes, and company details may remain until final launch details are ready, but placeholder URLs should not be submitted to Google Play
- If these pages later move to an official website, CMS, or separate frontend project, update the Google Play Console Privacy Policy URL to the new public URL at the same time
