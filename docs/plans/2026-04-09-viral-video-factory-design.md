# Viral Video Factory — Design Document

**Date:** 2026-04-09  
**Stack:** Next.js 14 (App Router) · TypeScript · Prisma + SQLite · Tailwind CSS · shadcn/ui

---

## Overview

A self-hosted "Video Factory" web app that automates the creation of short viral CCTV-style videos. The user selects a story (or picks randomly from 20 pre-seeded stories), clicks Generate, and watches live as the system writes a script via Claude (OpenRouter) and produces a video via kie.ai (Sora). Results are stored and browsable from a dashboard.

---

## Architecture

```
Browser (React)
  └─ Pages: Dashboard · Generate · Stories · Settings
       │
Next.js API Routes
  └─ /api/generate                  → start a job (POST)
  └─ /api/generate/[id]/stream      → SSE stream for live progress (GET)
  └─ /api/stories                   → CRUD (GET, POST, PUT, DELETE)
  └─ /api/settings                  → read/write API key overrides (GET, POST)
       │
SQLite (via Prisma)
  └─ Story    → id, title, content, createdAt
  └─ Job      → id, storyId, status, title, description, videoPrompt, videoUrl, taskId, errorMessage, createdAt
  └─ Setting  → key, value (API key overrides)
```

---

## Pages & UI

### Dashboard (`/`)
- Grid of recent jobs with thumbnail/placeholder, title, status badge
- "New Video" CTA button
- Dark theme matching CCTV/surveillance aesthetic

### Generate (`/generate`)
- Story selector dropdown + "Random" button
- Single "Generate" button
- Live progress panel (SSE-driven):
  - `✓ Story selected` → `✓ Script written` → `⟳ Generating video` → `✓ Done`
- Inline video player + download button on completion

### Stories (`/stories`)
- Table: title, content preview, Edit / Delete actions
- "Add Story" button with inline form (title + full story text)
- 20 default stories pre-seeded via Prisma seed on first run

### Settings (`/settings`)
- OpenRouter API Key field
- kie.ai API Key field
- Each field shows source: env var (locked) or DB override (editable)
- Save / Clear override buttons

---

## Data Flow

### Job Lifecycle States
```
idle → scripting → video_queued → video_processing → done
                                                    → failed
```

### SSE Event Schema
```json
{ "step": "scripting",          "message": "Writing script..." }
{ "step": "script_done",        "title": "...", "description": "...", "videoPrompt": "..." }
{ "step": "video_queued",       "taskId": "abc123" }
{ "step": "video_processing",   "attempt": 3 }
{ "step": "done",               "videoUrl": "https://..." }
{ "step": "failed",             "error": "kie.ai timeout after 5 attempts" }
```

### Polling Strategy
- kie.ai polled every 10 seconds
- Max 12 attempts (2 minutes total)
- Exceeding max → job marked `failed` with timeout message

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| OpenRouter API fails | Job marked `failed`, error shown inline |
| kie.ai key invalid | Immediate error with link to Settings |
| Network drop mid-stream | Frontend shows "Connection lost, refresh to check status"; job continues server-side |
| kie.ai timeout (>2 min) | Job marked `failed` with clear message |
| All errors | Persisted to `Job.errorMessage` for dashboard display |

---

## API Keys

- Loaded from `.env` as defaults (`OPENROUTER_API_KEY`, `KIE_AI_API_KEY`)
- Can be overridden via Settings UI (stored in `Setting` table)
- DB value takes precedence over env var at runtime

---

## Script Generation (OpenRouter / Claude Sonnet)

The scripting agent receives the story content and returns a structured JSON object:
```json
{
  "title": "string",
  "description": "string",
  "videoPrompt": "string"
}
```

System prompt includes all 20 stories with instructions to write from the perspective of CCTV footage — emotional, realistic, shareable.

---

## Video Generation (kie.ai / Sora)

- POST `videoPrompt` to kie.ai → receive `taskId`
- Poll `/status/:taskId` every 10s
- On `success` → extract video URL and save to `Job.videoUrl`
- Video rendered portrait (9:16) for TikTok / Reels compatibility
