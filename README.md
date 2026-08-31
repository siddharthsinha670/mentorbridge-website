# MentorBridge

**Bihar's home tutoring platform** — connects parents in Muzaffarpur (and across Bihar) with verified home tutors for students from Nursery to Class 10.

🔗 **Live site:** [mentorbridge.info](https://mentorbridge.info)
🔗 **Admin panel:** [mentorbridge.info/admin.html](https://mentorbridge.info/admin.html)

---

## Tech Stack

This is a **static site with no build step** — plain HTML/CSS/JS, deployed directly via GitHub Pages.

| Purpose | Service |
|---|---|
| Hosting | GitHub Pages (custom domain via `CNAME`) |
| Auth + teacher/parent database | [Supabase](https://supabase.com) (Postgres + Auth + Storage) |
| Student enquiry / teacher application forms | [SheetDB](https://sheetdb.io) → Google Sheets |
| Live chat widget | [Tawk.to](https://www.tawk.to) |
| Contact form fallback | [FormSubmit](https://formsubmit.co) |
| Fonts | Google Fonts (Plus Jakarta Sans, Nunito) |

There is no `npm install`, no bundler, no framework. Everything is one big `index.html` with inline `<style>` and `<script>` blocks, plus a separate `admin.html`.

---

## Repo Structure

```
index.html            The entire public website (SPA, hash-based routing: #about, #teachers, etc.)
admin.html             Password-protected admin dashboard (student/teacher enquiries, blog, portal users)
CNAME                  Custom domain config for GitHub Pages (mentorbridge.info)
sitemap.xml            SEO sitemap (hash-based URLs)
robots.txt             Points crawlers to sitemap.xml
logo.webp / logo.png   Optimized logo (used instead of the old base64-embedded version — see "Performance" below)
favicon.ico / favicon-32.png / apple-touch-icon.png / favicon.png
logo_b64.txt           Original full-size base64 logo source (kept for reference; not used by the site anymore)
scripts/*.gs           Legacy Google Apps Script backend (superseded by SheetDB — not currently wired up)
login.html
parent-dashboard.html
teacher-dashboard.html   Legacy standalone dashboard pages from an earlier iteration.
                          The login/teacher-dashboard/parent-dashboard functionality now
                          lives entirely inside index.html (#login, #teacher-dash, #parent-dash).
                          These three files are unused by the current site and safe to ignore
                          (or delete, once you're sure nothing external links to them).
plan.md                Original design brief (colors, fonts, page list) from project kickoff
```

---

## How the Site is Organized (index.html)

It's a single-page app: every "page" is a `<div id="p-something" class="page">`, and a `go(id)` JavaScript function shows/hides them and updates the URL hash (`#about`, `#teachers`, `#tutor-form`, etc.) via `history.pushState`.

Main pages:
- **Home, About, Services, Teachers, Blog, Contact** — public marketing pages
- **Find a Tutor** (`#tutor-form`) — parent enquiry form (multi-child support, subject checklist) → saves to SheetDB
- **Apply as Tutor** (`#teacher-form`) — teacher application form → saves to **both** SheetDB and Supabase (`teachers` table, `status: 'pending'`)
- **Login/Signup** (`#login`) — Supabase email/password auth, role selection (Parent / Teacher)
- **Teacher Dashboard** (`#teacher-dash`) — profile editing, photo upload, weekly schedule, mobile-friendly tab bar
- **Parent Dashboard** (`#parent-dash`) — shows the parent's own enquiries (matched by phone number against SheetDB)
- **Privacy Policy / Terms / Refund Policy / Verification Process** — static legal/info pages

Teacher cards on the homepage and the Teachers page are **not hardcoded** — they're fetched live from Supabase (`teachers` table, `status = 'approved'`, matched case/whitespace-insensitively) and rendered by a shared `renderTeacherCard()` function.

---

## Backend Setup

### Supabase

Project URL and anon key are hardcoded near the top of the `<head>` script in both `index.html` and `admin.html` (`SUPA_URL`, `SUPA_KEY`). The anon key is safe to expose client-side by design — it's meant to be public.

**Tables:**

`teachers`
| column | notes |
|---|---|
| id | uuid, primary key |
| uid | Supabase auth user id (nullable — enquiries submitted via the public "Apply as Tutor" form don't have a logged-in user yet) |
| name, email, phone, city | |
| qualification, experience, subjects, classes, board, mode | |
| about | free-text bio |
| photo | public URL from Supabase Storage (`teacher-photos` bucket) |
| status | `'pending'` or `'approved'` — only `approved` teachers show publicly |
| rating | set manually by admin (0–5, no automated review system yet) |
| schedule | JSONB, teacher's weekly availability |
| created_at, updated_at | |

`parents`
| column | notes |
|---|---|
| id, uid, name, email, phone, role, status, created_at | |

**Row Level Security is disabled** on both tables (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`), with explicit `GRANT` statements for the `anon` role. This was a deliberate choice for simplicity — there's no per-row ownership check, so all reads/writes go through the anon key. If you ever re-enable RLS, you'll need matching policies or every fetch in `index.html`/`admin.html` will silently return `[]`.

**Storage:** a public bucket named `teacher-photos` holds profile photos, uploaded directly from the browser in the Teacher Dashboard.

### SheetDB

Two endpoints, each backed by a separate Google Sheet:
- Student enquiries (`tfSubmit()` in the Find-a-Tutor form)
- Teacher applications (`sub()` handler for the Apply-as-Tutor form)

The admin panel reads from both to populate the Students/Teachers tables, and can update a row's `Status` field.

### Tawk.to

Live chat widget, loaded async near the end of `index.html`. A `MutationObserver` + polling loop labels the widget's iframe with `title="Chat support widget"` as soon as it appears (Tawk injects it dynamically, so it can't be titled directly in our HTML).

---

## Admin Panel

`admin.html` is gated by a simple client-side password check (see the `ADMIN` constant near the top of its script) — **this is not real server-side authentication**, just a UI gate. Change the password there if you're handing this repo to anyone else.

Sections:
- **Dashboard** — quick counts
- **Student Enquiries / Teacher Applications** — from SheetDB, with search/status filters, WhatsApp quick-reply, and inline status updates
- **Blog Management** — add/edit articles (stored in browser localStorage, not synced to Supabase/SheetDB — see "Known limitations")
- **Portal Teachers / Portal Parents** — real signed-up users from Supabase, with an Approve / Unapprove toggle and a manual rating dropdown
- **WA Templates** — customizable WhatsApp message templates (saved to localStorage)

---

## Known Limitations & Things to Know Before Changing Code

- **Two `go()` functions exist in `index.html`** (an old one and a newer one further down the file). The second one wins at runtime (later function declarations override earlier ones with the same name in the same scope). Both are kept in sync out of caution — if you add a new page-load trigger, add it to **both**.
- **Blog articles are stored in `localStorage`**, not a database. They won't sync across devices/browsers, and admin changes are only visible on whatever machine made them.
- **The public "Apply as Tutor" form** inserts into Supabase without a `uid` (since the applicant isn't logged in yet). If they later sign up through the portal with the same email, there's no automatic linking between the two records.
- **No automated review/testimonial system.** Teacher ratings are set manually by the admin; there's no way for parents to leave reviews yet.
- **SEO is hash-based** (`#about`, `#teachers`, ...), which Google does **not** treat as separate crawlable pages the way real paths (`/about`, `/teachers`) would be. If real SEO landing pages become a priority, this needs an actual multi-page rebuild (e.g. Next.js) — a hash-routed single HTML file can't fully solve that.
- **Unicode characters (emoji, ★, ✓, etc.) inside `<script>` tags have caused real outages before** in this project — a stray unicode character can silently break the entire script block's parsing, taking down every button on the page. Prefer HTML entities (`&#10003;`) or ASCII inside JS string literals over raw unicode/emoji.
- **Always validate before pushing.** A stray unclosed quote or `<td>` has broken things more than once. Before committing changes to `index.html` or `admin.html`, it's worth extracting each `<script>` block and running `node --check` on it, and confirming `<div>`/`<script>`/`<main>` tag counts balance.

---

## Deployment

Pushing to `main` deploys automatically via GitHub Pages. The custom domain is configured through the `CNAME` file (`mentorbridge.info`) and your domain registrar's DNS settings.

```bash
git add -A
git commit -m "your message"
git push origin main
```

Changes are typically live within 2–3 minutes.
