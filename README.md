<p align="center">
  <img src="docs/nexus-hero.png" width="920" alt="NEXUS AI — Ask anything" />
</p>

<p align="center">
  <a href="https://ai-web-rho-fawn.vercel.app"><img src="https://img.shields.io/badge/Live-Open_app-ffffff?style=for-the-badge&labelColor=000000" alt="Live app" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

<p align="center">
  <a href="https://ai-web-rho-fawn.vercel.app">Open app</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#creator">Creator</a>
</p>

## Overview

NEXUS AI is a production chat product. It is built to feel fast, stay on topic, and work on every device — from a first-time guest to a signed-in daily user.

**Live:** [ai-web-rho-fawn.vercel.app](https://ai-web-rho-fawn.vercel.app)

## Features

| | |
| :--- | :--- |
| **Write** | Draft emails, essays, captions, and reports. Rewrite until the tone is right. |
| **Code** | Paste an error or a snippet. Get a clear fix in plain English. |
| **Research** | Summarize notes, compare options, and turn thoughts into a brief. |
| **Files** | Upload a document or spreadsheet and ask questions about it. |
| **Access** | Guest chats, then a higher daily limit after login. |
| **Every device** | Phone, tablet, and desktop — header left, prompt at the bottom on mobile. |

## Pages

| Route | What it is |
| :--- | :--- |
| `/home` | Landing and founder |
| `/chat` | Full-screen AI chat |
| `/pricing` | Plans |
| `/login` · `/signup` | Account |
| `/settings` · `/profile` | Preferences |
| `/help` | FAQ |
| `/dashboard` | Overview |

## Stack

- **App** — Next.js 16, React 19, TypeScript
- **UI** — Tailwind CSS 4, Radix, Lucide
- **Data** — Prisma (optional)
- **Deploy** — Vercel

## Quick start

```bash
git clone https://github.com/atulchoudhary7781-dot/AI-web.git
cd AI-web
npm install
```

Create a `.env` file in the project root (never commit it):

```bash
OPENROUTER_API_KEY=your_key
DATABASE_URL=             # optional
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app lands on **Home**.

## Project layout

```text
src/app          routes and API
src/components   chat, intro, layout, UI
src/lib          models, quota, files, helpers
public           logo and images
docs             GitHub README art
```

## Notes

- Keep API keys in `.env`. They are gitignored.
- Chat stays available even if the database is not configured.
- Built to run worldwide without pinning the app to localhost.

## Creator

**Atul Choudhary** · AI Product Engineer · Delhi

He builds production AI systems — agentic workflows, RAG, and cinematic web clients. NEXUS AI is his platform.

[LinkedIn](https://www.linkedin.com/in/atul-choudhary-018037301/)

---

<p align="center">
  <sub>NEXUS AI · built with care</sub>
</p>
