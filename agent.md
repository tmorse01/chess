# Chess App Development Guidelines

## UI Component & Icon Library Standards

### Component Library: shadcn/ui

We use **shadcn/ui** as our component library. This is a collection of re-usable components built on top of Radix UI primitives, styled with Tailwind CSS.

**Why shadcn/ui?**

- Components are copied into your codebase (you own the code)
- Built with Radix UI for accessibility
- Fully customizable with Tailwind CSS
- TypeScript first
- No additional runtime dependencies for the components themselves

**Installation:**

```bash
# From workspace root
cd apps/web
npx shadcn-ui@latest init
```

**Adding Components:**

```bash
# Add individual components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tooltip
```

### Icon Library: Lucide React

We use **Lucide React** for all icons in the application.

**Why Lucide?**

- Modern, clean, and consistent design
- Tree-shakeable (only bundle icons you use)
- TypeScript support
- Large icon set with chess-relevant icons
- Highly customizable

**Installation:**

```bash
# From workspace root
cd apps/web
pnpm add lucide-react
```

**Usage Example:**

```tsx
import { Crown, Trophy, Clock, Play, Users, ChevronRight } from 'lucide-react';

// All icons accept className, size, color, strokeWidth props
<Crown className="w-6 h-6 text-yellow-500" />
<Trophy size={24} className="text-amber-600" />
<Clock strokeWidth={1.5} className="w-4 h-4" />
```

**Recommended Icons for Chess App:**

- `Crown` - for king/winner indicators
- `Trophy` - for victories/achievements
- `Clock` - for timers and game duration
- `Play`, `Pause`, `RotateCcw` - for game controls
- `Users` - for multiplayer indicators
- `Flag` - for resignation/end game
- `History` - for move history
- `Settings` - for game settings
- `Info` - for game information
- `Copy` - for copying game IDs
- `Check`, `X` - for check states and errors
- `ChevronRight`, `ChevronLeft` - for navigation

## Style System Guidelines

### Tailwind CSS Configuration

Our Tailwind config extends the default theme with chess-specific colors:

```javascript
// apps/web/tailwind.config.js
theme: {
  extend: {
    colors: {
      'chess-dark': '#312e2b',  // Dark square color
      'chess-light': '#b7c0d8', // Light square color
    },
  },
}
```

### Color Palette Usage

**Chess Board Colors:**

- `chess-dark` - Dark squares on the chess board
- `chess-light` - Light squares on the chess board

**UI Colors (Tailwind defaults):**

- `slate` - Primary UI elements, text, borders
- `emerald` or `green` - Success states, active games
- `red` - Errors, resignations, critical actions
- `amber` or `yellow` - Warnings, highlights, gold accents
- `blue` - Info states, links, secondary actions
- `gray` - Neutral elements, disabled states

### Component Styling Patterns

**Cards & Containers:**

```tsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200">
  {/* Content */}
</div>
```

**Buttons (with shadcn/ui):**

```tsx
import { Button } from '@/components/ui/button';

// Primary action
<Button variant="default">Start Game</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Resign</Button>
```

**Typography:**

```tsx
// Page titles
<h1 className="text-3xl font-bold text-slate-900">Chess Game</h1>

// Section headings
<h2 className="text-xl font-semibold text-slate-800">Game History</h2>

// Body text
<p className="text-slate-600">Game description...</p>

// Muted text
<span className="text-sm text-slate-500">Last updated 2 minutes ago</span>
```

**Spacing & Layout:**

- Use consistent spacing: `gap-4`, `space-y-4`, `p-4`, `my-6`
- Prefer flexbox and grid for layouts
- Use `max-w-7xl mx-auto` for page containers
- Use `container` class for responsive containers

### Component Architecture

**Component Structure:**

```tsx
// apps/web/src/components/ExampleComponent.tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface ExampleComponentProps {
  // Props definition
}

export function ExampleComponent({ ...props }: ExampleComponentProps) {
  return (
    <Card>
      <CardHeader>
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Title</h3>
      </CardHeader>
      <CardContent>{/* Content */}</CardContent>
    </Card>
  );
}
```

### Responsive Design

Always consider mobile-first responsive design:

```tsx
// Mobile: stack vertically, Desktop: side by side
<div className="flex flex-col md:flex-row gap-4">
  {/* Content */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Chess Game
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

### Dark Mode Support

Consider adding dark mode support using Tailwind's built-in dark mode:

```tsx
// Elements that adapt to dark mode
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{/* Content */}</div>
```

## Best Practices

### Component Organization

```
apps/web/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── ChessBoard.tsx   # Feature components
│   ├── GameInfo.tsx
│   └── GameResult.tsx
├── hooks/
├── pages/
└── ...
```

### Styling Guidelines

1. **Use Tailwind utility classes** - Avoid inline styles or CSS-in-JS
2. **Component composition** - Build complex UIs from shadcn/ui primitives
3. **Consistent spacing** - Stick to the spacing scale (4, 8, 16, 24, 32px)
4. **Icon sizing** - Use consistent icon sizes (`w-4 h-4`, `w-5 h-5`, `w-6 h-6`)
5. **Color semantics** - Use colors meaningfully (green=success, red=error, etc.)
6. **Accessibility** - Ensure proper contrast ratios and keyboard navigation

### Code Style

```tsx
// ✅ Good: Semantic, accessible, composable
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

export function GameCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <Button className="w-full">
          <Play className="mr-2 h-4 w-4" />
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}

// ❌ Avoid: Inline styles, non-semantic markup
export function GameCard() {
  return (
    <div style={{ padding: '24px', border: '1px solid #ccc' }}>
      <button style={{ width: '100%' }}>Start Game</button>
    </div>
  );
}
```

## Common Patterns for Chess App

### Game Status Indicators

```tsx
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy } from 'lucide-react';

<Badge variant="default">
  <Clock className="mr-1 h-3 w-3" />
  In Progress
</Badge>

<Badge variant="outline">
  <Users className="mr-1 h-3 w-3" />
  Waiting for Opponent
</Badge>

<Badge variant="secondary">
  <Trophy className="mr-1 h-3 w-3" />
  Completed
</Badge>
```

### Action Buttons

```tsx
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Flag } from 'lucide-react';

<div className="flex gap-2">
  <Button variant="default">
    <Play className="mr-2 h-4 w-4" />
    Start Game
  </Button>

  <Button variant="outline">
    <RotateCcw className="mr-2 h-4 w-4" />
    New Game
  </Button>

  <Button variant="destructive">
    <Flag className="mr-2 h-4 w-4" />
    Resign
  </Button>
</div>;
```

### Information Displays

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, Clock, Users } from 'lucide-react';

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Info className="h-5 w-5" />
      Game Information
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-slate-500" />
      <span>Started 5 minutes ago</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Users className="h-4 w-4 text-slate-500" />
      <span>2 players</span>
    </div>
  </CardContent>
</Card>;
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Lucide Icons Browser](https://lucide.dev/icons/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
