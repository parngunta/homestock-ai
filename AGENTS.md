# HomeStock AI — Agent Guide

## Project Overview
HomeStock AI is a household inventory management web application. It is being redesigned from an admin-dashboard feel into a mobile-first, consumer-friendly household management app.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, shadcn/ui patterns, React Query, React Router, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma ORM (currently SQLite), JWT auth
- **Shared**: `shared/` package with types and constants
- **Design**: Mobile-first, clean minimal flat aesthetic, dark mode supported

## Important Conventions
- Use the new consumer-first UI components in `client/src/components/new-ui/` for new work.
- Prefer `client/src/components/ui/button.tsx` for actions.
- The app uses a bottom navigation bar with a centered "Add" tab on mobile.
- Dark mode is toggled via a class on `document.documentElement`.
- Database provider was switched from PostgreSQL to SQLite due to local environment constraints.

## Running the App
1. Backend dev server: `cd server && npx tsx watch src/index.ts` (runs on port 3001)
2. Frontend dev server: `cd client && npx vite --host --port 3000` (port 5173 was occupied)
3. Browser agent: `agent-browser open http://localhost:3000`

## File Structure Notes
- `client/src/components/new-layout.tsx` — new app shell with top bar, bottom nav (centered Add tab), household switcher.
- `client/src/components/new-ui/sheet.tsx` — bottom-sheet component for the dashboard AI chat.
- `client/src/components/new-ui/alert-dialog.tsx` — accessible confirmation dialogs.
- `client/src/components/new-ui/toast.tsx` — lightweight toast notifications.
- `client/src/pages/new-dashboard.tsx` — redesigned dashboard with real activity feed and actionable attention rows.
- `client/src/pages/new-inventory.tsx` — redesigned inventory using flat list rows with subtle status labels.
- `client/src/pages/new-shopping.tsx` — redesigned shopping list.
- `client/src/pages/new-ai-chat.tsx` — AI assistant page (chat is also available as a sheet from the dashboard).
- `client/src/pages/new-household.tsx` — household/members page with real activity feed.
- `client/src/pages/new-notifications.tsx` — notifications page.
- `client/src/pages/new-item-detail.tsx` — item detail page with confirmation dialogs and toast feedback.
- `client/src/pages/add-item.tsx` — unified add item with receipt/barcode/voice/manual/shopping modes.
- `client/src/pages/new-login.tsx` / `new-register.tsx` — redesigned auth.
- `server/src/services/activity-service.ts` and `server/src/routes/activity.ts` — real household activity feed backend.
- `design/ux-redesign.md` — full UX audit and redesign documentation.

## Design Tokens
Colors are defined as CSS variables in `client/src/index.css`. The redesign uses a clean, minimal, flat palette:
- Primary is a flat blue (`--primary: 210 100% 50%`).
- Background is a near-white gray (`--background: 0 0% 98%`).
- Cards are pure white with a light border (`--card`, `--border`).
- Font stack is Inter / system-ui for a clean, official-app feel.
- Shadows are minimal and subtle; avoid heavy shadows, glows, or gradients.

## Conventions
- Use `px-5` page padding and `pb-28` safe-area bottom padding via the app shell.
- Lists should use `divide-y divide-border rounded-xl border border-border overflow-hidden` with `bg-card` rows.
- Status labels should be small plain text or subtle pills, not heavy badges or left border strips.
- Bottom navigation uses a centered "Add" tab; there is no floating action button.
- Avoid warm gradients, heavy shadows, cream backgrounds, and rounded-2xl/rounded-3xl oversized cards.

## Gotchas
- `expiryDate` was added to the Prisma schema. The create-item API must also accept it; this is not yet wired in.
- The AI service falls back to rule-based responses when `OPENAI_API_KEY` is not set.
- Agent-browser screenshots require the frontend server to be running on port 3000.
