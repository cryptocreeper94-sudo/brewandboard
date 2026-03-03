# Trust Layer Canonical UI Protocol — Agent Handoff Reference

This document defines the **exact** UI/UX protocol used across all Trust Layer ecosystem applications. Any agent working on Trust Layer products (including Lot Ops Pro, ORBIT, Orby Commander, etc.) MUST follow these patterns precisely. No deviations. No "close enough." Match it exactly.

---

## 1. THEME — Dark Only, No Exceptions

There is NO light mode. Every page, every component, every modal is dark theme.

### Color Tokens (CSS Custom Properties)
```css
--background: 230 35% 7%;       /* #0c1224 — Deep Space Blue */
--foreground: 210 40% 98%;       /* Near-white text */
--primary: 180 100% 50%;         /* #00ffff — Cyan Neon */
--primary-foreground: 230 35% 7%;
--secondary: 270 70% 60%;        /* #9333ea — Electric Purple */
--secondary-foreground: 210 40% 98%;
--accent: 180 100% 50%;          /* Same as primary — Cyan */
--accent-foreground: 230 35% 7%;
```

### Studio Theme (for IDE/Developer tools)
```
Background: #050508
Cyan accent: #00e5ff
Purple accent: #7c3aed
Magenta accent: #e040fb
```

### Text Opacity Hierarchy
| Level | Class | Usage |
|-------|-------|-------|
| Primary text | `text-white` | Headings, important values |
| Secondary text | `text-white/70` or `text-gray-300` | Subheadings, labels |
| Tertiary text | `text-white/40` or `text-gray-400` | Descriptions, helper text |
| Muted text | `text-white/30` or `text-gray-500` | Timestamps, metadata |
| Disabled | `text-white/20` | Inactive items |

---

## 2. GLASSMORPHISM — The GlassCard Component

Every card in the ecosystem uses the `GlassCard` component. Never use a plain `<div>` for card-like containers.

### Component: `<GlassCard>`
**Props:**
- `glow` (boolean) — Adds cyan glow shadow + gradient border aura
- `hover` (boolean, default true) — Enables scale/lift on hover
- `locked` (boolean) — Shows "Coming Soon" overlay with lock icon
- `className` (string) — Applied to the OUTER motion.div wrapper
- `variant` ("default" | "stat" | "feature") — Reserved for future use

### Exact Tailwind Classes
```
Base:
  bg-[rgba(12,18,36,0.65)]
  backdrop-blur-2xl
  border border-white/[0.08]
  rounded-xl
  overflow-hidden
  transition-all duration-300

Glow ON:
  shadow-[0_0_40px_rgba(0,255,255,0.15)]
  + absolute sibling: -inset-[1px] rounded-xl bg-gradient-to-r from-primary/30 via-cyan-400/20 to-secondary/30 -z-10 blur-sm opacity-50

Glow OFF:
  shadow-lg shadow-black/20

Hover animation (Framer Motion):
  whileHover={{ scale: 1.02, y: -2 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

### CRITICAL PADDING RULE
**NEVER put padding classes (`p-6`, `p-4`, etc.) on the GlassCard `className` prop.** The GlassCard itself should have NO padding. Instead, wrap inner content in a `<div>` with padding:

```tsx
// WRONG — padding on GlassCard
<GlassCard glow className="p-6">
  <h3>Title</h3>
</GlassCard>

// CORRECT — inner div handles padding
<GlassCard glow>
  <div className="p-5 sm:p-7">
    <h3>Title</h3>
  </div>
</GlassCard>
```

Standard inner padding: `p-5 sm:p-7`

---

## 3. LAYOUT — True Bento Grid (3-Column)

### Page Container
```tsx
<div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
  <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    {/* content */}
  </main>
</div>
```

Max width options: `max-w-6xl` (standard) or `max-w-7xl` (wide pages)

### Grid Structure
```tsx
// Standard 3-column bento
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards}
</div>

// 4-column variant (for ecosystem directory, icon-heavy grids)
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
  {cards}
</div>

// 6-column dashboard variant
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[140px]">
  {cards}
</div>
```

### Bento Spanning
Cards can span multiple columns/rows for visual interest:
```tsx
// Large card (2x2)
<div className="md:col-span-2 md:row-span-2">
  <GlassCard glow>{/* hero content */}</GlassCard>
</div>

// Medium card (1 col, 2 rows)
<div className="md:col-span-1 md:row-span-2">
  <GlassCard>{/* tall content */}</GlassCard>
</div>

// Full width card
<div className="col-span-full">
  <GlassCard>{/* wide content */}</GlassCard>
</div>
```

### NO VERTICAL STACKING RULE
Groups of cards that would normally stack vertically MUST be placed in a carousel instead. If you have 4+ cards of the same type (e.g., feature cards, team cards, testimonial cards), they go in a horizontal carousel — NOT stacked in a column.

---

## 4. CAROUSELS — Self-Contained Inside Bento Cards

Two carousel patterns are used:

### Pattern A: Embla Carousel (Standard)
```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

<Carousel
  opts={{
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
    loop: false
  }}
  className="w-full"
>
  <CarouselContent className="-ml-5">
    {items.map((item, i) => (
      <CarouselItem key={i} className="pl-5 basis-full sm:basis-[310px] md:basis-[340px]">
        <GlassCard>
          <div className="p-5 sm:p-7">{/* card content */}</div>
        </GlassCard>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious className="hidden sm:flex" />
  <CarouselNext className="hidden sm:flex" />
</Carousel>
```

### Pattern B: Native Scroll (Performance-Heavy Pages)
For pages with many carousels or lightweight needs:
```tsx
<div className="relative group">
  {canScrollLeft && (
    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
  )}
  <div
    ref={scrollRef}
    className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
    style={{ scrollbarWidth: "none" }}
  >
    {items.map((item, i) => (
      <div key={i} className="snap-start shrink-0 w-[260px] md:w-[300px]">
        <GlassCard>{/* content */}</GlassCard>
      </div>
    ))}
  </div>
  {canScrollRight && (
    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
  )}
</div>
```

### Self-Contained Carousel Inside a Bento Card
When a carousel lives INSIDE a GlassCard (e.g., a "Featured Items" card in the bento grid):
```tsx
<div className="md:col-span-2">
  <GlassCard glow>
    <div className="p-5 sm:p-7">
      <h3 className="text-lg font-bold text-white mb-4">Featured</h3>
    </div>
    <div className="px-5 sm:px-7 pb-5 sm:pb-7">
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-3">
          {items.map((item, i) => (
            <CarouselItem key={i} className="pl-3 basis-[200px]">
              {/* mini card content */}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  </GlassCard>
</div>
```

---

## 5. ACCORDIONS — Radix UI Based

### Component Library
Built on `@radix-ui/react-accordion`, re-exported from `@/components/ui/accordion`.

### Usage Pattern
```tsx
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";

<GlassCard>
  <Accordion type="single" collapsible className="px-4 py-3 sm:px-6 sm:py-4">
    {items.map((item, i) => (
      <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
        <AccordionTrigger className="hover:no-underline py-4 px-2 group">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">{item.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-4">
          <p className="text-white/60 text-sm">{item.content}</p>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
</GlassCard>
```

### Accordion Animations
CSS keyframes (defined in tailwind config):
- `animate-accordion-down` — expand
- `animate-accordion-up` — collapse
- Trigger chevron: `[&[data-state=open]>svg]:rotate-180`

---

## 6. TYPOGRAPHY

### Font Stack
- **Display/Headings**: `font-display` (Inter or system font at heavy weight)
- **Body**: Default sans-serif (Tailwind's `font-sans`)

### Heading Patterns
```tsx
// Page title — gradient text
<h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight">
  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
    Page Title
  </span>
</h1>

// Section title — gradient text
<h2 className="text-3xl sm:text-4xl font-display font-bold mb-3">
  <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
    Section Title
  </span>
</h2>

// Card title
<h3 className="text-lg font-bold text-white mb-2">Card Title</h3>

// Stat value
<p className="text-2xl font-bold font-display text-white">$12,345</p>
```

### Gradient Text Recipe
Always use this exact pattern:
```
bg-gradient-to-r from-{color1} to-{color2} bg-clip-text text-transparent
```
Common gradients:
- Cyan to purple: `from-cyan-400 to-purple-400`
- White fade: `from-white to-white/70`
- Amber: `from-amber-400 to-orange-400`
- Blue to cyan: `from-blue-400 to-cyan-400`

---

## 7. SKELETON LOADING & SHIMMER

### Base Skeleton
```tsx
// Simple skeleton pulse
<div className="animate-pulse rounded-md bg-white/5 h-4 w-32" />

// OR using the Skeleton component
import { Skeleton } from "@/components/ui/skeleton";
<Skeleton className="h-4 w-32" />  // Uses: animate-pulse rounded-md bg-primary/10
```

### Pre-Built Skeleton Layouts
Located in `@/components/loading-skeleton`:
- `CardSkeleton` — Avatar + text lines
- `TableSkeleton` — Row-based table
- `StatsSkeleton` — Grid of stat boxes
- `ChartSkeleton` — Graph placeholder
- `ProfileSkeleton` — Header with circular avatar
- `TransactionSkeleton` — List items
- `NftCardSkeleton` — Large image area card
- `PageSkeleton` — Full page combining above

### Shimmer Effect
For premium/holographic feel on progress bars and stat cards:
```tsx
<div className="relative overflow-hidden">
  {/* Actual content */}
  <div className="h-2 bg-cyan-500 rounded-full" style={{ width: "65%" }} />
  {/* Shimmer overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
</div>
```

### Page Load Spinner
```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
</div>
```

---

## 8. ANIMATIONS — Framer Motion Patterns

### Page Entry
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  {/* page content */}
</motion.div>
```

### Scroll-Triggered Entry (Sections)
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* section content */}
</motion.div>
```

### Staggered Children
```tsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
  {items.map((i) => (
    <motion.div key={i} variants={item}>
      <GlassCard>{/* content */}</GlassCard>
    </motion.div>
  ))}
</motion.div>
```

### Tab/Panel Transitions
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {/* tab content */}
  </motion.div>
</AnimatePresence>
```

---

## 9. BACKGROUND EFFECTS — Glow Orbs & Particles

Every page has floating background glow orbs. They MUST be contained to prevent horizontal scroll.

### Glow Orb Pattern
```tsx
// Wrapper MUST have overflow-hidden
<div className="min-h-screen bg-[#050508] overflow-x-hidden relative">
  {/* Glow orbs — ALWAYS inside a fixed/absolute overflow-hidden container */}
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/[0.05] rounded-full blur-[100px]" />
    <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-pink-500/[0.04] rounded-full blur-[100px]" />
  </div>
  
  {/* Page content */}
  <main className="relative z-10">...</main>
</div>
```

**CRITICAL**: Never position glow orbs at `right-0` or `left-0` without the container having `overflow-hidden`. This causes horizontal scroll on mobile.

### Dot Grid Background
```tsx
<div className="absolute inset-0 pointer-events-none"
  style={{
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '40px 40px'
  }}
/>
```

---

## 10. BUTTONS

### Primary CTA
```tsx
<Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-[0_0_30px_rgba(6,182,212,0.25)]">
  Action Text
</Button>
```

### Secondary CTA
```tsx
<Button variant="outline" className="border-white/10 hover:border-cyan-500/30 text-white hover:bg-white/5">
  Secondary Action
</Button>
```

### Large CTA (Hero sections)
```tsx
<Button size="lg" className="h-13 px-10 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-[0_0_50px_rgba(168,85,247,0.3)] border-0">
  <Rocket className="w-4 h-4 mr-2" /> Big Action
</Button>
```

---

## 11. BADGES

```tsx
import { Badge } from "@/components/ui/badge";

// Status badges
<Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
<Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>

// Feature badge
<Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">New</Badge>

// Premium badge
<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
  <Sparkles className="w-3 h-3 mr-1" /> Premium
</Badge>
```

---

## 12. IMAGES — Photorealistic in All Cards

Every card that represents a product, feature, or entity MUST have an image. Placeholder text-only cards are NOT acceptable.

### Image Patterns
```tsx
// Card with image header
<GlassCard>
  <div className="aspect-video w-full overflow-hidden">
    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
  </div>
  <div className="p-5 sm:p-7">
    <h3 className="text-lg font-bold text-white">{title}</h3>
  </div>
</GlassCard>

// Card with icon instead of image (for abstract features)
<GlassCard>
  <div className="p-5 sm:p-7">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
      <Shield className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
  </div>
</GlassCard>
```

### Image Rules
- Always use `object-cover` for card images
- Always wrap in `overflow-hidden` container
- Use `aspect-video` (16:9) or `aspect-[4/3]` for consistency
- AI-generated images should be photorealistic, dark-themed, futuristic
- Never use stock photos that feel "corporate" or "bright office"

---

## 13. MOBILE-FIRST RULES

### Touch Targets
Minimum **44px** height for all interactive elements:
```tsx
<Button className="min-h-[44px]">Tap Me</Button>
<a className="min-h-[44px] flex items-center">Link</a>
```

### Responsive Font Sizes
```
Page title: text-4xl sm:text-5xl md:text-7xl
Section title: text-2xl sm:text-3xl md:text-4xl
Card title: text-lg (fixed)
Body: text-sm sm:text-base
Small/meta: text-xs sm:text-sm
```

### Mobile Grid Behavior
```
Desktop (lg): 3 columns
Tablet (md): 2 columns
Mobile: 1 column (full width cards)
```

Cards that would create long vertical lists on mobile should instead be placed in horizontal carousels.

---

## 14. DATA-TESTID CONVENTION

Every interactive or meaningful element gets a `data-testid`:
```
Interactive: {action}-{target}     → button-submit, input-email, link-profile
Display: {type}-{content}          → text-username, img-avatar, status-payment
Dynamic: {type}-{desc}-{id}        → card-product-${id}, row-user-${index}
```

---

## 15. ICONS

Use **Lucide React** exclusively. Never use Font Awesome, Heroicons, or inline SVGs.
```tsx
import { Shield, Rocket, ChevronDown, Settings, Zap } from "lucide-react";
```

Common icon sizes:
- In buttons: `w-4 h-4`
- In cards: `w-5 h-5` or `w-6 h-6`
- Feature icons: `w-7 h-7` (inside gradient icon containers)
- Hero icons: `w-8 h-8`

---

## 16. SECTION STRUCTURE

Every page section follows this pattern:
```tsx
<section className="py-16 sm:py-20 relative">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
    {/* Section header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <Badge className="bg-cyan-500/20 text-cyan-400 mb-4">Category</Badge>
      <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3">
        <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Section Title
        </span>
      </h2>
      <p className="text-white/40 max-w-xl mx-auto">
        Brief description of what this section covers.
      </p>
    </motion.div>

    {/* Section content (grid, carousel, or accordion) */}
    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GlassCards */}
      </div>
    </motion.div>
  </div>
</section>
```

---

## 17. NAVIGATION BAR

Fixed top nav on every page:
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
  <div className="container mx-auto px-4 h-14 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <BackButton />
      <h1 className="text-lg font-bold text-white">Page Title</h1>
    </div>
    {/* Right side actions */}
  </div>
</nav>
```

---

## 18. TECH STACK SUMMARY

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | Wouter |
| State | TanStack Query |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| UI Components | Radix UI (shadcn/ui) |
| Carousel | Embla Carousel |
| Accordion | Radix Accordion |
| Backend | Express.js + Drizzle ORM + PostgreSQL |
| Charts | Recharts |
| 3D Engine | React Three Fiber + drei |

---

## 19. COMMON MISTAKES TO AVOID

1. **Padding on GlassCard** — Never. Always use inner `<div>` with `p-5 sm:p-7`
2. **Vertical card stacking** — Use carousels for 4+ same-type cards
3. **Light backgrounds** — Never. Everything is dark themed
4. **Missing overflow-hidden** — Glow orbs cause horizontal scroll without it
5. **Generic stock photos** — Use photorealistic, dark, futuristic imagery
6. **Flat cards** — Every card needs glassmorphism, blur, and border
7. **Missing animations** — Every section entrance should use Framer Motion
8. **Plain text headings** — Major headings use gradient text
9. **Missing data-testid** — Every interactive element needs one
10. **Using div as buttons** — Use `<Button>` component from UI library

---

## 20. QUICK REFERENCE — Copy-Paste Patterns

### Full Page Template
```tsx
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function MyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/[0.05] rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-white">Page Title</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-6xl relative z-10">
        <section className="py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Headline
              </span>
            </h1>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={fadeUp}>
                <GlassCard glow>
                  <div className="p-5 sm:p-7">
                    <h3 className="text-lg font-bold text-white mb-2">Card Title</h3>
                    <p className="text-white/40 text-sm">Description</p>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
```

---

*This document is the single source of truth for all Trust Layer ecosystem UI. When in doubt, reference this file.*
