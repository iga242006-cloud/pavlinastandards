# Pavlina Agency — Global Standards for Claude Code

You are building websites for Pavlina, a healthcare digital agency serving independent medical practices. Every site you build or update must follow ALL of these rules without being reminded.

---

## 🎨 DESIGN — Non-Negotiable

- Sites must look **premium and conversion-focused** — if someone lands on it, they should want to book immediately
- Use a strong visual hierarchy: bold headline, clear subheadline, CTA above the fold
- Typography: pair a serif display font (Playfair Display, Fraunces, or similar) with a clean sans-serif body (Inter, DM Sans)
- Color palette must feel medical-premium: deep navy, teal, white, with a warm accent (gold or soft green) not neccasarily always these colors as they vary per client
- Hero section must be full-viewport with a dark gradient background — never a plain white hero
- Cards get hover lift effects, sections get scroll fade-in animations
- Mobile-first. Test every breakpoint. No horizontal scroll on mobile.
- Never ship a generic-looking template. Every site gets a distinctive visual identity.

---

## 🌐 EN/ES LANGUAGE TOGGLE — Always Include

Every site MUST have a bilingual English/Spanish toggle. Implementation rules:

- Toggle lives in the nav as a pill: `[EN] [ES]` — navy background, teal active state
- Use `data-en="..."` and `data-es="..."` attributes on EVERY text element
- `setLang(lang)` function swaps all `data-en`/`data-es` content via JS
- `<html lang="en">` updates to `lang="es"` on toggle
- Placeholders on inputs also swap via `data-placeholder-en` / `data-placeholder-es`
- Default language: English
- No separate page routes — single page, client-side toggle only

---

## 🤖 ARIA — AI Receptionist (Always Include)

Every site gets ARIA, the AI virtual receptionist. Rules:

- Fixed bottom-right floating chat button (teal gradient, 62px circle)
- ARIA must know: practice name, doctor name, services offered, hours, phone, address, insurance accepted, languages spoken, booking process, same-day availability, new patient status
- All ARIA knowledge comes from the project CLAUDE.md — never make up details
- ARIA responds in whatever language is currently active (EN or ES)
- Include quick-reply buttons on first message
- Typing indicator (animated dots) before each ARIA response
- Pattern-match user input to knowledge base; fallback to phone number

---

## 🔍 SEO — Every Page, Every Time

Must include on every build:

- Unique `<title>` and `<meta name="description">` with local keywords
- `<meta name="keywords">`, `<meta name="robots" content="index, follow">`, `<link rel="canonical">`
- Open Graph tags: `og:title`, `og:description`, `og:url`, `og:type`, `og:locale`, `og:locale:alternate`
- Twitter Card tags
- JSON-LD structured data: `MedicalBusiness` (or `LocalBusiness`) + `FAQPage` schemas
- `<html lang="en">` (updates to `es` on toggle)
- Semantic HTML: one `<h1>`, logical `<h2>`/`<h3>` hierarchy, no skipping levels
- Every image gets descriptive `alt` text
- `<link rel="preconnect">` for Google Fonts
- `loading="lazy"` on all below-fold images

---

## 🏥 UPDATING AN EXISTING SITE — Audit First, Always

Before touching a single line of code on an existing site:

1. READ and document every existing element:
   - Current `<title>` and meta description
   - Existing JSON-LD schemas (copy them out)
   - All `<h1>`, `<h2>`, `<h3>` tags
   - Analytics tags (Google Analytics ID, GTM, Pixel IDs)
   - Third-party scripts (chat widgets, booking tools, etc.)
   - Form `action` URLs and endpoints
   - Internal links and navigation structure
   - Any existing EN/ES content

2. Output a brief audit block at the top of your first response listing everything found

3. NEVER remove or overwrite: existing SEO meta, schema markup, analytics tags, form endpoints, or third-party integrations — unless explicitly told to

4. Build on top of what exists. Preserve all functionality.

---

## ⚙️ CODE STANDARDS

- Stack: vanilla HTML/CSS/JS unless client spec says otherwise
- No unused dependencies or libraries
- CSS custom properties (`--navy`, `--teal`, etc.) for all colors and tokens
- WCAG 2.1 AA accessibility minimum: ARIA labels on interactive elements, visible focus rings, 4.5:1 contrast ratio
- Smooth scroll behavior on all anchor links
- Intersection Observer for scroll-triggered fade-up animations
- Nav gets `box-shadow` on scroll via `.scrolled` class
- All CTAs use `border-radius: 999px` (pill shape)
- Footer always includes: Pavlina credit link, contact info, hours, navigation links

---

## 📋 SECTIONS EVERY DOCTOR SITE NEEDS

In order:
1. Fixed nav (logo + links + EN/ES toggle + Book CTA + mobile hamburger)
2. Hero (headline + subheadline + trust badges + CTA + appointment form or phone)
3. Stats strip (years, rating, patients, languages)
4. Services grid (cards with icon, name, description, CTA)
5. Why Us / differentiators (split layout with doctor quote)
6. Insurance accepted (pill grid)
7. Doctor profile (photo, bio, credentials, tags)
8. Testimonials (on dark background)
9. FAQ (accordion + JSON-LD FAQPage schema)
10. Book / CTA section (call + online + directions options)
11. Footer (4-column: brand, services, practice info, hours)
12. ARIA chatbot (floating bottom-right)

---

## 🏷️ PAVLINA BRANDING

- Footer credit on every site: `Digital infrastructure by <a href="https://pavlina.health">Pavlina</a>`
- Never use "Pavlina Health Expansion" — the brand name is just **Pavlina**
- Contact: isaac@pavlina.health · (317) 702-6731

