# ViveKit Design Polish Implementation Guide

Based on Emil Kowalski's design engineering principles, this guide provides step-by-step implementation for adding professional polish and animations to ViveKit.

## Phase 1: Foundation (Week 1)

### 1.1 Global Animation System

Create `src/styles/animations.css` with custom easing curves and animation utilities:

```css
:root {
  /* Custom easing curves - stronger than CSS defaults */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  /* Standard durations */
  --duration-fast: 100ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-modal: 400ms;

  /* Stagger delays */
  --stagger-xs: 30ms;
  --stagger-sm: 50ms;
  --stagger-md: 80ms;
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-base: 0ms;
    --duration-slow: 0ms;
    --duration-modal: 0ms;
  }
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Why:** All animations flow from these constants. Changing durations in one place affects the entire app. Custom easing feels 30% more polished than CSS defaults.

### 1.2 Button Press Feedback

Update all button components to include `scale(0.97)` on `:active`:

```css
button {
  transition: transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

button:active {
  transform: scale(0.97);
}

button:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Where to apply:**
- `src/components/ui/Button.tsx` - Primary component
- `src/components/admin/*.tsx` - All admin page buttons
- `src/components/Intelligence/*.tsx` - Lead extraction buttons
- Any `<button>` or `[role="button"]` element

**Why:** Buttons must feel responsive to press. Without this, clicking feels disconnected from the UI.

### 1.3 Response Generation Feedback

Update `/api/ai/generate` response and UI in `src/components/workspace/ResponseGenerator.tsx`:

```jsx
// Button state during generation
<button disabled={isGenerating} className={isGenerating ? 'opacity-50' : ''}>
  {isGenerating ? (
    <>
      <Spinner className="spinner--with-pulse" />
      Generating...
    </>
  ) : (
    'Generate Response'
  )}
</button>

// Response reveal animation (character by character or fade-in)
const [revealedResponse, setRevealedResponse] = useState('');

useEffect(() => {
  if (!generatedResponse) return;
  
  let charIndex = 0;
  const interval = setInterval(() => {
    if (charIndex < generatedResponse.length) {
      setRevealedResponse(generatedResponse.slice(0, charIndex + 1));
      charIndex++;
    } else {
      clearInterval(interval);
    }
  }, 15); // ~15ms per character for smooth reveal
  
  return () => clearInterval(interval);
}, [generatedResponse]);
```

**Why:** 
- Spinner pulse makes loading feel faster (perceived performance)
- Character reveal draws attention to new content
- Users see progress as response streams in

### 1.4 Validation Error Banner

Update `src/components/ResponseValidator.tsx` to animate error entry:

```jsx
import { useState, useEffect } from 'react';

export function ValidationBanner({ violations }) {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    setIsEntering(true);
  }, [violations]);

  if (violations.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-red-50 border-l-4 border-red-600 p-4 rounded-md',
        'animation: reveal-banner',
        'animation-duration: var(--duration-base)',
        'animation-timing-function: var(--ease-out)',
        'animation-fill-mode: forwards'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-red-600 text-lg">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">
            {violations.filter(v => v.severity === 'critical').length} Policy Violations
          </h3>
          <div className="mt-2 space-y-1">
            {violations
              .filter(v => v.severity === 'critical')
              .map((v, i) => (
                <div key={i} className="text-sm text-red-800">
                  • {v.message}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**CSS:** Add to `animations.css`:
```css
@keyframes reveal-banner {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

**Why:** 
- Clip-path reveal draws attention without layout shift
- Vertical animation matches "message appearing" narrative
- Groups critical violations at top for visual hierarchy

---

## Phase 2: Dashboard Polish (Week 2)

### 2.1 KPI Card Stagger Animation

Update `src/app/admin/usage/page.tsx`:

```jsx
export default function UsagePage() {
  const cards = [
    { label: 'Total Conversations', value: '324' },
    { label: 'Avg Response Time', value: '2.3s' },
    { label: 'Acceptance Rate', value: '87%' },
    { label: 'Generation Errors', value: '12' },
  ];

  return (
    <div className="space-y-6">
      <h1>Usage & Performance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-gray-200 p-6"
            style={{
              animation: 'scale-fade-in var(--duration-base) var(--ease-out) forwards',
              animationDelay: `calc(var(--stagger-sm) * ${idx})`,
              opacity: 0, // Start invisible
            }}
          >
            <div className="text-sm text-gray-600 mb-2">{card.label}</div>
            <div className="text-3xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**CSS:** Add to `animations.css`:
```css
@keyframes scale-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Why:**
- Stagger creates visual rhythm (not overwhelming)
- Scale-fade is more natural than instant appearance
- Perceived performance: cards appear to "grow in"

### 2.2 Counter Animation for Numbers

Update KPI values to animate from 0 to final number:

```jsx
import { useEffect, useState } from 'react';

function AnimatedCounter({ value, duration = 500 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numValue = parseInt(value);
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayValue(Math.floor(progress * numValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="inline-block">
      {displayValue.toLocaleString()}
    </span>
  );
}

// Usage: <AnimatedCounter value={324} />
```

**Why:** Animated counters draw attention without being annoying. Users perceive progress.

### 2.3 Chart Bar Reveal Animation

For usage/cost charts, add clip-path reveals:

```jsx
// In chart rendering
const chartBars = data.map((item, idx) => (
  <div
    key={idx}
    className="relative"
    style={{
      animation: 'reveal-clip-btm var(--duration-slow) var(--ease-out) forwards',
      animationDelay: `calc(var(--stagger-xs) * ${idx})`,
      clipPath: 'inset(0 0 100% 0)',
    }}
  >
    <div
      className="bg-blue-600 rounded-t-md h-20"
      style={{ width: `${(item.value / maxValue) * 100}%` }}
    />
    <div className="text-xs text-gray-600 mt-1">{item.label}</div>
  </div>
));
```

**CSS:** Add to `animations.css`:
```css
@keyframes reveal-clip-btm {
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

**Why:** Vertical reveal matches data flowing in from bottom. Stagger creates left-to-right visual flow.

---

## Phase 3: Advanced Polish (Week 3)

### 3.1 Lead Extraction UX

Update `src/components/intelligence/LeadExtraction.tsx`:

```jsx
export function LeadExtraction({ extractedData }) {
  const confidenceTiers = {
    high: extractedData.filter(d => d.confidence >= 0.85),
    medium: extractedData.filter(d => d.confidence >= 0.70 && d.confidence < 0.85),
    low: extractedData.filter(d => d.confidence < 0.70),
  };

  return (
    <div className="space-y-4">
      {Object.entries(confidenceTiers).map(([tier, items]) => (
        <div
          key={tier}
          className="border rounded-lg overflow-hidden"
        >
          <button
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex items-center gap-2"
            onClick={(e) => {
              const details = e.currentTarget.nextElementSibling;
              details?.classList.toggle('hidden');
            }}
          >
            <span className="font-semibold capitalize">{tier} Confidence</span>
            <span className="text-sm text-gray-600">({items.length})</span>
            <span className="ml-auto">▾</span>
          </button>

          <div className="p-4 space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded border border-gray-200"
                style={{
                  animation: 'scale-fade-in var(--duration-base) var(--ease-out) forwards',
                  animationDelay: `calc(var(--stagger-xs) * ${idx})`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.field}</span>
                  <ConfidenceBar value={item.confidence} />
                </div>
                <div className="text-sm text-gray-600">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfidenceBar({ value }) {
  const percent = Math.round(value * 100);
  const color =
    value >= 0.85 ? 'bg-green-500' :
    value >= 0.70 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{
            width: `${percent}%`,
            animation: 'width var(--duration-slow) var(--ease-out)',
          }}
        />
      </div>
      <span className="text-xs font-semibold">{percent}%</span>
    </div>
  );
}
```

**Why:**
- Progressive disclosure reduces cognitive load
- Confidence bars are more scannable than percentages
- Staggered card entry creates visual priority

### 3.2 CRM Context Sidebar

Update `src/components/workspace/ContextSidebar.tsx`:

```jsx
export function ContextSidebar({ clientProfile, memories }) {
  const [expandedSections, setExpandedSections] = useState({
    memories: true,
    history: true,
    relationship: true,
  });

  return (
    <aside className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      {/* Client Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-gray-900">{clientProfile.name}</h2>
        
        {/* Relationship Strength Bar */}
        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-1">Relationship Strength</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{
                width: `${clientProfile.relationshipStrength}%`,
                animation: 'width var(--duration-slow) var(--ease-out)',
              }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {clientProfile.relationshipStrength}/100
          </div>
        </div>
      </div>

      {/* Collapsible Memory Sections */}
      {['memories', 'history', 'relationship'].map((section) => (
        <div key={section} className="mb-4 border rounded-lg">
          <button
            className="w-full p-3 bg-gray-50 hover:bg-gray-100 font-medium text-sm flex items-center gap-2"
            onClick={() => setExpandedSections(s => ({ ...s, [section]: !s[section] }))}
          >
            <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
            <span className="ml-auto transform transition-transform" style={{
              transform: expandedSections[section] ? 'rotate(180deg)' : 'rotate(0)',
            }}>
              ▾
            </span>
          </button>

          {expandedSections[section] && (
            <div className="p-3 space-y-2 border-t">
              {getMemoriesForSection(section, memories).map((mem, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-700 p-2 bg-gray-50 rounded flex items-start gap-2"
                  style={{
                    animation: 'fade-in var(--duration-base) var(--ease-out)',
                    animationDelay: `calc(var(--stagger-xs) * ${idx})`,
                  }}
                >
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{mem.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
```

**Why:**
- Collapsible sections reduce information density
- Checkmarks highlight memories that were used
- Smooth expansion/collapse with ease-in-out

---

## Implementation Checklist

### Week 1 (High-Impact)
- [ ] Add global `animations.css` with easing curves
- [ ] Update all buttons with scale press feedback
- [ ] Add response generation spinner + character reveal
- [ ] Implement validation error banner with clip-path reveal
- [ ] Test with `prefers-reduced-motion` media query

### Week 2 (Dashboard)
- [ ] Add KPI card stagger animation
- [ ] Implement counter animations for numbers
- [ ] Add chart bar clip-path reveals
- [ ] Test on slow connections (DevTools throttling)

### Week 3 (Advanced)
- [ ] Implement lead extraction disclosure UI
- [ ] Add CRM context sidebar with collapsible sections
- [ ] Polish navigation (sidebar collapse animation)
- [ ] Conduct slow-motion review (2x-5x playback speed)

## Performance Testing

Use these methods to verify animations perform well:

```bash
# Test with motion preferences disabled
defaults write com.apple.universalaccessibility reduceMotionEnabled 1

# Test on slow device simulator
# Chrome DevTools → Performance tab → CPU throttling

# Frame-by-frame inspection
# Chrome DevTools → Animations panel → Slow down playback
```

## Key Metrics

Track these to confirm polish is working:

| Metric | Target | Method |
|--------|--------|--------|
| Button press latency | <100ms visual feedback | DevTools Performance tab |
| Animation smoothness | 60 FPS | DevTools → Rendering tab |
| Perceived load time | Spinner feels faster | User testing |
| Motion sickness risk | Zero in reduced-motion mode | Manual testing |
| Keyboard nav speed | No animation delay | Keyboard-only test |

## Accessibility Requirements

All animations must respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* Durations become 0ms */
  /* Opacity/color transitions OK, movement animations removed */
}
```

And support keyboard navigation:

```css
*:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

---

## References

- [Animations.dev](https://animations.dev/) - Emil Kowalski's animation course
- [Easing.dev](https://easing.dev/) - Custom easing curve builder
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - MDN accessibility reference

Last Updated: 2026-06-03
