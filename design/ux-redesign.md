# HomeStock AI UX Redesign

## Audit of Current Experience

### Pain Points
1. **Admin dashboard feel** — Dense stats, metric cards, and data tables dominate. This serves managers, not families.
2. **Passive information** — Dashboard shows counts but does not tell the user what to do next.
3. **Hidden AI** — The AI assistant is buried in the sidebar navigation, treated as an advanced feature.
4. **No sense of household** — Member activity, collaboration, and shared responsibility are invisible.
5. **Weak empty states** — "No items found" does not teach or guide.
6. **No emotional warmth** — Green-on-white is functional but sterile. It does not feel like a home.
7. **Mobile sidebar** — Navigation is still a desktop sidebar concept even on small screens.

### Redesign Principles

1. **Action First**
   - The top of the screen tells users exactly what needs attention today.
   - One-tap actions: review low stock, add to shopping list, log usage.

2. **Progressive Disclosure**
   - Surface only what matters most.
   - Show details, history, and configuration only on tap.

3. **AI Native**
   - The AI assistant is a persistent, prominent input at the top of the dashboard.
   - Voice and camera inputs are first-class citizens.

4. **Household Focus**
   - Show recent member activity.
   - Make shared responsibility visible and assignable.

5. **Empty State Excellence**
   - Every empty state has a friendly illustration, a clear explanation, and a primary action.

6. **Mobile First**
   - Bottom navigation, thumb-friendly actions, and card-based layouts.

7. **Warm, Friendly Aesthetic**
   - Soft backgrounds, rounded shapes, friendly color accents, subtle motion.

## Information Architecture

### Primary Navigation (Bottom Tab Bar on Mobile)
1. **Home** — Dashboard with attention, AI input, quick actions.
2. **Inventory** — Browse, search, add items.
3. **Add** — Central action: scan receipt, barcode, voice, or manual item.
4. **Shopping** — Shared list with priorities and assignments.
5. **Household** — Members, activity, settings.

### Secondary Navigation
- Profile, notifications, and household switcher live in the top bar.
- AI assistant is available as a floating action or top search input on Home.

### Page Hierarchy

#### Home
- Greeting + attention count
- AI ask bar (persistent)
- Attention cards (running out, expiring, low stock)
- Shopping list preview
- Recent household activity
- Inventory snapshot by category

#### Inventory
- Search + filter
- Category/locations tabs
- Item cards with status indicators
- Quick actions: add, adjust, move

#### Add (Sheet/Modal)
- Camera scan receipt
- Barcode scan
- Voice input
- Manual add

#### Shopping
- Segmented control: To Buy / Purchased
- Priority pills
- Assignee avatars
- Add from attention suggestions

#### Household
- Member avatars
- Invite flow
- Activity feed
- Household settings

## Component Hierarchy

```
App
├── TopBar (greeting, household switcher, notifications)
├── MainContent
│   ├── HomePage
│   │   ├── AttentionSection
│   │   ├── AIInputBar
│   │   ├── ShoppingPreview
│   │   ├── ActivityFeed
│   │   └── InventorySnapshot
│   ├── InventoryPage
│   │   ├── SearchHeader
│   │   ├── CategoryTabs
│   │   └── ItemGrid
│   ├── ShoppingPage
│   │   ├── FilterTabs
│   │   └── ShoppingList
│   └── HouseholdPage
│       ├── MemberSection
│       └── ActivitySection
├── FloatingAddButton (mobile) / TopAddButton (desktop)
├── BottomNav
└── AIChatSheet (slide-up overlay)
```

## Design System Recommendations

### Color Palette
- **Background**: `#FAFAF8` (warm off-white), `#0F0F10` dark
- **Surface**: `#FFFFFF`, `#1C1C1E` dark
- **Primary**: `#34C759` fresh green (Apple-style)
- **Attention/Urgent**: `#FF3B30`
- **Warning**: `#FF9500`
- **Info/AI**: `#5E5CE6`
- **Text primary**: `#1C1C1E`
- **Text secondary**: `#8E8E93`
- **Borders**: `rgba(0,0,0,0.06)`
- **Shadows**: large, soft, colored-tinted

### Typography
- Font: system-ui / SF Pro / Inter
- Headings: medium weight, tight tracking
- Body: regular, readable
- Use `font-feature-settings: "tnum"` for quantities

### Spacing & Shapes
- Base radius: `20px` for cards, `999px` for pills
- Large spacing: `24px` between sections
- Generous padding inside cards

### Motion
- Page transitions: `0.25s ease-out`
- Card press: scale `0.98`
- Skeleton screens for loading
- Staggered list entrance

## Accessibility Improvements
- Larger touch targets (min 44x44)
- High contrast status indicators
- Screen reader labels on all icon buttons
- Focus visible states
- Reduced motion support

## Conversion & Retention
- Smart onboarding: first action is "add your first item" with camera/voice
- Push-style attention badges on app icon and tabs
- Weekly summary of what the household used
- Celebration micro-interactions when items are checked off
- Smart restock reminders based on consumption predictions

## New Dashboard Layout

```
Good Evening 👋

3 items need attention
[Review]

Ask HomeStock...
___________________________

Running Out Soon
🟠 Toilet Paper - 5 days
🟠 Cat Food - 7 days
🔴 Milk - expires tomorrow

Shopping List
5 items pending
[View List]

Recent Activity
Mom added eggs
Dad purchased detergent
You updated cat food

Inventory Snapshot
Food          24
Bathroom      12
Laundry        8
Pet Supplies   5
```

## Implementation Plan
1. Update global styles and design tokens.
2. Build new bottom navigation and top bar.
3. Redesign Dashboard page.
4. Redesign Inventory, Shopping, Household pages.
5. Add Add Item sheet with scan/voice/manual options.
6. Add AI assistant as persistent input + chat sheet.
7. Add dark mode.
8. Add animations and micro-interactions.
9. Build and verify.
