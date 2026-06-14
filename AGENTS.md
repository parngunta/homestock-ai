# HomeStock AI — Agent Guide

## Project Overview
HomeStock AI is a household inventory management web application. It is being redesigned from an admin-dashboard feel into a mobile-first, warm, friendly, family-oriented consumer household app inspired by PantryPal, Apple Home, Headspace, Notion, Duolingo, Finch, and Cash App.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, shadcn/ui patterns, React Query, React Router, Zustand, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Prisma ORM (currently SQLite), JWT auth
- **Shared**: `shared/` package with types and constants
- **Design**: Mobile-first, warm consumer aesthetic, dark mode supported

## Important Conventions
- Use the new consumer-first UI components in `client/src/components/new-ui/` for new work.
- Prefer `client/src/components/ui/button.tsx` for actions.
- The app uses a bottom navigation bar with Home · Inventory · Shopping · Activity · Profile tabs, plus a floating action button (FAB) that opens Scan Receipt / Scan Barcode / Voice / Add Item.
- Dark mode is toggled via a class on `document.documentElement`.
- Database provider was switched from PostgreSQL to SQLite due to local environment constraints.
- The frontend dev server may fall back to another port if 3000 is occupied; check the actual `Local:` URL printed by Vite.

## Running the App
1. Backend dev server: `cd server && npx tsx watch src/index.ts` (runs on port 3001)
2. Frontend dev server: `cd client && npx vite --host --port 3000` (port 5173 was occupied; Vite may fall back to 3002 if 3000 is in use)
3. Browser agent: `agent-browser open http://localhost:3000` (or the actual Vite port)

## File Structure Notes
- `client/src/components/new-layout.tsx` — new app shell with warm top bar, bottom nav (Home/Inventory/Shopping/Activity/Profile), floating action button sheet, and profile menu.
- `client/src/components/new-ui/fab.tsx` — floating action button and action sheet.
- `client/src/components/new-ui/empty-state.tsx` — friendly empty-state illustrations with primary CTA.
- `client/src/components/new-ui/card.tsx` / `input.tsx` / `badge.tsx` / `avatar.tsx` — refreshed consumer-style primitives.
- `client/src/components/new-ui/sheet.tsx` — bottom-sheet component for the dashboard AI chat.
- `client/src/components/new-ui/alert-dialog.tsx` — accessible confirmation dialogs.
- `client/src/components/new-ui/toast.tsx` — lightweight toast notifications.
- `client/src/pages/new-dashboard.tsx` — redesigned dashboard with hero greeting, AI assistant card, quick actions, attention cards, shopping preview, and activity feed.
- `client/src/pages/new-inventory.tsx` — redesigned inventory as a card-based grid with emoji icons, category filters, and status chips.
- `client/src/pages/new-shopping.tsx` — redesigned shopping list with progress bar, large checkboxes, and modern checklist cards.
- `client/src/pages/new-ai-chat.tsx` — AI assistant page (chat is also available as a sheet from the dashboard).
- `client/src/pages/new-household.tsx` — household/members page with family avatars and real activity feed.
- `client/src/pages/new-notifications.tsx` — notifications page.
- `client/src/pages/new-item-detail.tsx` — item detail page with emoji hero, status badge, quick adjust, and confirmation dialogs.
- `client/src/pages/add-item.tsx` — unified add item with receipt/barcode/voice/manual/shopping modes and animated tab transitions.
- `client/src/pages/new-login.tsx` / `new-register.tsx` — redesigned auth.
- `server/src/services/activity-service.ts` and `server/src/routes/activity.ts` — real household activity feed backend.
- `design/ux-redesign.md` — full UX audit and redesign documentation.

## Design Tokens
Colors and typography are defined as CSS variables in `client/src/index.css` and Tailwind theme extensions in `client/tailwind.config.js`:
- Primary green `#22C55E` (`--primary`), success `#16A34A`, warning `#F59E0B`, danger `#EF4444`.
- Warm off-white background `#FAFAF7` (`--background`), pure white cards `#FFFFFF` (`--card`).
- Near-black text `#111827` (`--foreground`), secondary text `#6B7280` (`--muted-foreground`).
- Font stack: Inter / system-ui. Hero titles 40px, sections 28px, card titles 18px, body 16px, secondary 14px.
- Generous rounded corners (20–28px), soft shadows, warm gradients (`gradient-green`, `gradient-blue`), and glow accents.

## Conventions
- Use `px-5` page padding and `pb-28` safe-area bottom padding via the app shell.
- Cards should be pure white with subtle borders and rounded-2xl/rounded-3xl corners; use `shadow-soft` and `shadow-card` for elevation.
- Status labels use friendly colored pills/badges (`default`, `primary`, `warning`, `danger`, `success`, `ghost`).
- Lists can be card grids or rounded card rows; prefer emoji/illustration over generic icons for inventory and attention items.
- Bottom navigation uses Home/Inventory/Shopping/Activity/Profile with a green floating action button, not a centered Add tab.
- Add Framer Motion spring micro-interactions (`whileTap`, `staggerChildren`) to buttons, cards, and page sections.
- Avoid heavy shadows, glows, or enterprise warehouse aesthetics.

## Gotchas
- `expiryDate` is in the Prisma schema and the update-item path accepts it; ensure manual add flows expose it when relevant.
- The AI service falls back to rule-based responses when `OPENAI_API_KEY` is not set.
- Agent-browser screenshots require the frontend server to be running; use the actual `Local:` URL printed by Vite (often `http://localhost:3000` or `http://localhost:3002`).
