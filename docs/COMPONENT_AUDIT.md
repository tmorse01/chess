# Component & Icon Audit

## 🎯 Executive Summary

This audit identifies:

- **4 emojis** to replace with Lucide icons
- **8 shadcn/ui components** to add
- **Multiple component refactorings** for better consistency and accessibility

---

## 📋 Emojis to Replace with Lucide Icons

### Frontend Components (High Priority)

| File             | Line    | Current Emoji | Replacement Icon       | Context                       |
| ---------------- | ------- | ------------- | ---------------------- | ----------------------------- |
| `Home.tsx`       | 84, 103 | 📋            | `Copy`                 | Copy link to clipboard button |
| `GameResult.tsx` | 85      | 🏆            | `Trophy`               | Victory state                 |
| `GameResult.tsx` | 86      | 🤝            | `Handshake`            | Draw state                    |
| `GameResult.tsx` | 87      | 😔            | `Frown` or `CloudRain` | Defeat state                  |

### Backend/Console Logs (Low Priority - Optional)

| File                         | Line   | Current Emoji | Replacement | Notes                        |
| ---------------------------- | ------ | ------------- | ----------- | ---------------------------- |
| `apps/api/src/server.ts`     | 57     | 🚀            | Plain text  | Console logs - cosmetic only |
| `apps/api/src/server.ts`     | 58     | 🔌            | Plain text  | Console logs - cosmetic only |
| `apps/api/src/db/migrate.ts` | 22, 23 | 🔄📍          | Plain text  | Console logs - cosmetic only |

**Recommendation:** Focus on frontend emojis only. Backend emojis in console logs are acceptable to keep.

---

## 🧩 shadcn/ui Components to Add

### Priority 1 - Core Components (Add First)

#### 1. Button Component

**Why:** Replace custom `button-primary` class with accessible, variant-based buttons
**Usage locations:**

- `Home.tsx` - "Create New Game", "Create Another Game"
- `GameInfo.tsx` - "Copy Share Link", "Offer Draw", "Resign"
- `GameResult.tsx` - "New Game"

**Variants needed:**

- `default` - Primary actions
- `outline` - Secondary actions
- `destructive` - Resign button
- `secondary` - Copy/share actions

**Install:**

```bash
cd apps/web
npx shadcn-ui@latest add button
```

#### 2. Card Component

**Why:** Replace `frosted-glass` divs with semantic card structure
**Usage locations:**

- `Home.tsx` - Main container, game link sections
- `Game.tsx` - Game info sidebar
- `GameResult.tsx` - Result modal content

**Install:**

```bash
npx shadcn-ui@latest add card
```

#### 3. Alert Component

**Why:** Replace custom error/status message divs
**Usage locations:**

- `Home.tsx` - Error messages (line 60)
- `Game.tsx` - Error messages (line 61)
- `GameInfo.tsx` - "Waiting for players" message (line 130)

**Install:**

```bash
npx shadcn-ui@latest add alert
```

### Priority 2 - Enhanced UX Components

#### 4. Badge Component

**Why:** Better status indicators with semantic colors
**Usage locations:**

- `GameInfo.tsx` - Connection status indicator
- `GameInfo.tsx` - Turn indicator
- Future: Game status badges

**Install:**

```bash
npx shadcn-ui@latest add badge
```

#### 5. Separator Component

**Why:** Replace `border-t border-white/10` with semantic dividers
**Usage locations:**

- `GameInfo.tsx` - Between sections (line 109)

**Install:**

```bash
npx shadcn-ui@latest add separator
```

#### 6. Input Component

**Why:** Replace `input-field` class with accessible inputs
**Usage locations:**

- `Home.tsx` - Link display fields (lines 77, 96)

**Install:**

```bash
npx shadcn-ui@latest add input
```

### Priority 3 - Advanced Components

#### 7. Dialog Component

**Why:** Replace fixed overlay modal with accessible dialog
**Usage locations:**

- `GameResult.tsx` - Game result modal overlay

**Install:**

```bash
npx shadcn-ui@latest add dialog
```

#### 8. Tooltip Component

**Why:** Enhance button hover states with proper tooltips
**Usage locations:**

- `Home.tsx` - Copy button (has title attribute on line 83)
- Future: Action button hints

**Install:**

```bash
npx shadcn-ui@latest add tooltip
```

---

## 🔧 Suggested Refactoring Order

### Phase 1: Icons (Quick Wins)

1. Replace emojis in `GameResult.tsx` with Lucide icons
2. Replace clipboard emoji in `Home.tsx` with `Copy` icon
3. Update tests to check for icon presence instead of emoji text

### Phase 2: Core Components

1. Add Button component and refactor all buttons
2. Add Alert component and refactor error messages
3. Add Badge component for status indicators

### Phase 3: Layout Components

1. Add Card component and refactor containers
2. Add Separator for dividers
3. Add Input for text fields

### Phase 4: Advanced Components

1. Add Dialog for game result modal
2. Add Tooltip for enhanced UX
3. Remove custom CSS classes from `index.css` as they're replaced

---

## 📦 Installation Commands

Run all at once:

```bash
cd apps/web
npx shadcn-ui@latest add button card alert badge separator input dialog tooltip
```

---

## 🎨 Style Migration Notes

### Current Custom Classes to Replace

| Current Class     | Replace With                 | Notes                                 |
| ----------------- | ---------------------------- | ------------------------------------- |
| `.button-primary` | `<Button>` component         | Remove from index.css after migration |
| `.frosted-glass`  | `<Card>` with custom variant | Keep as custom card variant           |
| `.input-field`    | `<Input>` component          | Remove from index.css after migration |

### Frosted Glass Treatment

The `.frosted-glass` effect is unique to this app. After adding Card component, create a custom variant:

```tsx
// Add to apps/web/src/components/ui/card.tsx after installation
const cardVariants = cva('...', {
  variants: {
    variant: {
      default: '...',
      frosted: 'bg-white/10 backdrop-blur-md border-white/20 rounded-2xl shadow-2xl',
    },
  },
});
```

---

## 🧪 Test Updates Required

After icon replacements, update these test files:

1. **`GameResult.test.tsx`**
   - Lines 33, 45: Replace `getByText('🏆')` with icon test
   - Lines 57, 69: Replace `getByText('😔')` with icon test
   - Lines 107, 121: Replace `getByText('🤝')` with icon test

Example test update:

```tsx
// Before
expect(screen.getByText('🏆')).toBeInTheDocument();

// After
const trophyIcon = screen.getByTestId('trophy-icon'); // or use getByRole
expect(trophyIcon).toBeInTheDocument();
```

---

## 📊 Impact Summary

**Components to Refactor:** 5 files

- `Home.tsx`
- `Game.tsx`
- `GameInfo.tsx`
- `GameResult.tsx`
- `ChessBoard.tsx` (minor)

**Test Files to Update:** 1 file

- `GameResult.test.tsx`

**Estimated Effort:**

- Phase 1 (Icons): 1-2 hours
- Phase 2 (Core): 2-3 hours
- Phase 3 (Layout): 2-3 hours
- Phase 4 (Advanced): 1-2 hours
- **Total: 6-10 hours**

**Benefits:**

- ✅ Consistent, accessible components
- ✅ Better mobile experience
- ✅ Easier theming and customization
- ✅ Professional appearance
- ✅ Reduced custom CSS maintenance
