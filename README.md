# Muhammad Wajdan Ismail: portfolio

A React and Vite portfolio with an ID-card profile on the left and folder-style tabs on the right
(Projects, Experience, Education, Tech stack). Light theme is caramel paper, dark theme is slate.

## Run it

```bash
npm install
npx playwright install chromium   # once, for the browser tests
npm run dev                       # http://localhost:5173
```

## Edit the content

All text lives in `src/data.js`: profile, contact links, projects, experience, education and tech groups.
The photo is `public/photo.jpg`. Tab counts and the duration of the current role update on their own.

Each project opens in a modal with a slide show and detail tabs. Their content is in `src/projectDetails.js`:
the slides (clips, screenshots, phone screens, text cards) and the tabs. The Folio pictures and clips are in
`public/projects/folio/` as `screens/<name>-<theme>.webp`, `thumbs/` (320 x 200), `video/<id>.mp4` with a
`-poster.jpg`, and `card-<theme>.webp` for the card. To add a project, add its media the same way and an entry
in `projectDetails.js`. The Folio notes say what is not known yet (timeline, live demo link, repository links),
so none of those are on the page.

Each project in `src/data.js` has a `repo` field. With a `url` the card and the modal show a "View on GitHub" link;
with `url: null` they show a greyed-out "Soon" placeholder, so a link can be added by changing one line.

## Resume PDF

The downloadable resume is `public/Muhammad_Wajdan_Ismail_Resume.pdf`, built from `resume/resume.tex`.
After changing the CV text, run `npm run resume` (needs a LaTeX install with `pdflatex`) and commit the new PDF.
Keep it to one page. The site's View and Download buttons both point at this file.

## Quality gates

`npm run check` runs these in order and stops at the first failure:

| Gate | Command | Passes when |
| --- | --- | --- |
| Lint | `npm run lint` | No ESLint errors (React, hooks, accessibility, no eval or raw HTML) |
| Unit tests | `npm test` | Tabs, keyboard use, theme toggle, copy buttons, links, content and duration logic |
| Build | `npm run build` | Production build succeeds |
| Security scan | `npm run security` | No unsafe APIs, no inline scripts, headers present, no secrets in `src/` |
| Dependency audit | `npm run audit` | No high or critical vulnerabilities |
| Browser tests | `npm run e2e` | Every tab, in both themes at desktop and phone width, has no WCAG 2.1 AA violations, no console errors and no horizontal scroll; security headers present |
| Lighthouse | `npm run lighthouse` | Performance 90+, accessibility 95+, best practices 95+, SEO 95+ on desktop and mobile |

Visual review: `npm run shots -- screenshots` renders every tab in both themes at both sizes. Compare the
result with `design/reference/`.

## Deploy

`npm run build` produces `dist/`. Upload it to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages).