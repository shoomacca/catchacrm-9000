# Design System Tokens

## Colors

### Brand Palette

**Primary (Blue)**
- brand-primary-50: Light backgrounds, hover states
- brand-primary-100: Light backgrounds
- brand-primary-500: Standard blue
- brand-primary-600: Buttons, links, primary actions
- brand-primary-700: Hover states for primary buttons
- brand-primary-900: Dark text on light backgrounds

**Success (Green)**
- brand-success-50: Success background light
- brand-success-100: Success background
- brand-success-500: Standard success
- brand-success-600: Success buttons, positive states

**Warning (Orange)**
- brand-warning-50: Warning background light
- brand-warning-100: Warning background
- brand-warning-500: Standard warning
- brand-warning-600: Warning buttons, caution states

**Danger (Red)**
- brand-danger-50: Error background light
- brand-danger-100: Error background
- brand-danger-500: Standard error
- brand-danger-600: Error buttons, destructive actions

### Usage Guidelines
- Primary: Use brand-primary-600 for buttons, links, and primary actions
- Success: Use brand-success-600 for positive states and confirmations
- Warning: Use brand-warning-600 for caution states and warnings
- Danger: Use brand-danger-600 for errors and destructive actions

---

## Typography

### Font Size Scale

| Class | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| text-xs | 10px | 16px | 800 | Labels (uppercase, tracked) |
| text-sm | 12px | 18px | 600 | Body small, captions |
| text-base | 14px | 22px | 500 | Body text, standard content |
| text-lg | 16px | 24px | 600 | Subheadings, emphasized text |
| text-xl | 20px | 28px | 700 | H3 headings |
| text-2xl | 24px | 32px | 800 | H2 headings |
| text-3xl | 30px | 38px | 900 | H1 small |
| text-4xl | 36px | 44px | 900 | H1 standard |
| text-5xl | 48px | 56px | 900 | Hero headings |

### Usage Guidelines
- Labels: Use text-xs with uppercase and letter spacing for form labels
- Body: Use text-base for standard content
- Headings: Use text-2xl to text-5xl hierarchy for page structure

---

## Spacing

### Scale (4px base unit)

| Class | Value | Use Case |
|-------|-------|----------|
| space-px | 1px | Borders, dividers |
| space-0 | 0px | No spacing |
| space-0.5 | 2px | Tight spacing |
| space-1 | 4px | Very tight |
| space-1.5 | 6px | Compact elements |
| space-2 | 8px | Small gaps |
| space-2.5 | 10px | Standard compact |
| space-3 | 12px | Standard spacing |
| space-4 | 16px | Comfortable spacing |
| space-5 | 20px | Medium spacing |
| space-6 | 24px | Large spacing |
| space-8 | 32px | Extra large |
| space-10 | 40px | Section spacing |
| space-12 | 48px | Large sections |
| space-16 | 64px | Extra large sections |
| space-20 | 80px | Hero sections |

### Usage Guidelines
- Use multiples of 4px for consistent rhythm
- Standard gaps: space-4 (16px)
- Section spacing: space-8 to space-12 (32-48px)

---

## Border Radius

| Class | Value | Use Case |
|-------|-------|----------|
| rounded-none | 0px | Sharp corners |
| rounded-sm | 8px | Badges, tags, small elements |
| rounded (DEFAULT) | 12px | Inputs, form elements |
| rounded-md | 16px | Buttons, small cards |
| rounded-lg | 24px | Large cards, panels |
| rounded-xl | 32px | Hero sections, large features |
| rounded-full | 9999px | Pills, avatars, circular elements |

### Usage Guidelines
- Badges/Tags: rounded-sm (8px)
- Inputs: rounded (12px)
- Buttons/Cards: rounded-md (16px)
- Large Cards: rounded-lg (24px)
- Hero Sections: rounded-xl (32px)
- Avatars/Pills: rounded-full

---

## Box Shadows

| Class | Value | Use Case |
|-------|-------|----------|
| shadow-sm | Subtle | Subtle elevation, input fields |
| shadow (DEFAULT) | Light | Standard elevation |
| shadow-md | Medium | Cards, panels |
| shadow-lg | Large | Modals, dropdowns, popovers |
| shadow-xl | Extra Large | Hero elements, emphasized cards |
| shadow-brand | Blue glow | Primary CTAs, special emphasis |

### Usage Guidelines
- Inputs: shadow-sm
- Cards: shadow-md
- Modals/Dropdowns: shadow-lg
- Primary CTAs: shadow-brand for special emphasis

---

## Implementation Notes

1. All tokens are defined in `tailwind.config.ts`
2. Use semantic naming (brand-primary, not blue-600)
3. Tokens extend Tailwind defaults (don't replace)
4. All values align to 4px grid for consistency
5. Typography includes pre-configured line heights and weights

---

## Button Components

### Button Variants

#### Primary
Used for main CTAs and primary actions.
```tsx
<Button variant="primary">Save Changes</Button>
```

#### Secondary
Used for secondary actions.
```tsx
<Button variant="secondary">Cancel</Button>
```

#### Ghost
Used for tertiary actions and minimal UI.
```tsx
<Button variant="ghost">Learn More</Button>
```

#### Danger
Used for destructive actions.
```tsx
<Button variant="danger">Delete Account</Button>
```

#### Success
Used for positive confirmations.
```tsx
<Button variant="success">Approve</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (Default)</Button>
<Button size="lg">Large</Button>
```

### Button with Icon

```tsx
import { Plus } from 'lucide-react';

<Button icon={<Plus className="h-4 w-4" />} iconPosition="left">
  Add New
</Button>

<Button icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
  Continue
</Button>
```

### Loading State

```tsx
<Button loading>Processing...</Button>
```

### Full Width

```tsx
<Button fullWidth>Submit Form</Button>
```

### Icon Button

```tsx
import { Search, Settings, X } from 'lucide-react';

<IconButton
  icon={<Search className="h-5 w-5" />}
  label="Search"
  variant="ghost"
/>

<IconButton
  icon={<Settings className="h-5 w-5" />}
  label="Settings"
  variant="secondary"
  size="lg"
/>
```

### Button Group

```tsx
<ButtonGroup>
  <Button variant="secondary">Day</Button>
  <Button variant="secondary">Week</Button>
  <Button variant="primary">Month</Button>
</ButtonGroup>
```

### Accessibility

All buttons include:
- Proper focus states with visible ring
- Active state feedback (scale-95)
- Disabled state styling
- ARIA labels for icon buttons
- Keyboard navigation support

---

## Next Steps (Future Shards)

- M02A_03: Create form input components
- M02A_04: Build card and panel components
- M02A_05: Establish spacing utilities
- M02A_06: Create comprehensive component showcase
