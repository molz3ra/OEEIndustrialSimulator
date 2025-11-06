# OEE-Dash Design Guidelines

## Design Approach

**System:** Material Design with industrial adaptations
**Rationale:** Material Design provides robust patterns for data-rich applications, clear visual hierarchy, and excellent form design—ideal for manufacturing environments requiring clarity and efficiency.

---

## Core Design Elements

### Typography
- **Primary Font:** Roboto (via Google Fonts CDN)
- **Hierarchy:**
  - Hero/Status Indicators: Bold, 48-56px
  - Section Headers: Medium, 32-40px
  - Body/Forms: Regular, 16-18px
  - Labels/Metadata: Regular, 14px
  - Data/Numbers: Mono (for precise alignment)

### Layout System
**Spacing Primitives:** Tailwind units of **4, 6, 8, 12, 16** (p-4, gap-6, mb-8, py-12, mt-16)
- Operator Interface: Centered layout, max-w-2xl container
- Dashboard: Full-width with max-w-7xl for analytics
- Touch Targets: Minimum 12-16 units (48-64px) for tablet interface
- Grid System: 12-column for dashboard, single-column for operator view

---

## Interface-Specific Guidelines

### 1. Shop Floor Operator Interface (Tablet-Optimized)

**Layout:**
- Full viewport height with centered content
- Large, prominent status buttons dominating the screen
- Form modal/card overlay when LINE DOWN is pressed

**Key Components:**

**Status Buttons:**
- LINE DOWN: Large pill button (w-64, h-20), red accent
- LINE UP: Large pill button (w-64, h-20), green accent
- Generous spacing between buttons (gap-8)
- Icons from Heroicons (ArrowDown, ArrowUp)

**Downtime Form (Modal/Card):**
- Centered overlay with backdrop blur
- Max-width container (max-w-lg)
- Generous padding (p-8)
- Large dropdown select (h-14)
- Multi-line textarea for notes (h-32)
- Clear submit/cancel buttons

**Active Downtime Display:**
- Real-time timer showing elapsed downtime
- Large, monospace font for time display
- Pulsing indicator for active status

### 2. Management Dashboard

**Layout Structure:**
- Top navigation bar with app title and timestamp
- Statistics cards row (3-4 cards across on desktop)
- Main analytics section (2-column grid on desktop)
- Data table at bottom

**Key Components:**

**Statistics Cards:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: Metric value (large, bold), label (small, muted)
- Metrics: Total Downtime, Number of Events, Average Duration, Current Status
- Subtle borders, rounded corners

**Analytics Charts Section:**
- Top Downtime Reasons (Horizontal Bar Chart)
- Downtime Distribution (Donut/Pie Chart)
- Use chart library placeholders (Chart.js recommended)
- Ensure clear axis labels and legends

**Downtime Events Table:**
- Responsive table with striped rows
- Columns: Timestamp, Reason, Duration, Notes, Status
- Sortable headers
- Color-coded status badges (red=down, green=resolved)

**Dashboard Navigation:**
- Simple top bar with: Logo/Title, Time Period Selector, Export Button
- Breadcrumbs if multiple views exist

---

## Component Library

### Buttons
- Primary: Solid fill, rounded-lg, shadow-sm
- Secondary: Outline style, transparent background
- Large (Operator): h-20 py-4 px-12 text-xl
- Standard (Dashboard): h-12 py-3 px-6 text-base

### Forms
- Input fields: h-14 on operator, h-12 on dashboard
- Labels: font-medium, mb-2
- Dropdown selects: Full-width, large touch target
- Validation: Inline error messages below fields

### Cards
- Border: border rounded-lg
- Padding: p-6 for stats, p-8 for forms
- Shadow: shadow-md for elevation

### Status Indicators
- Badges: Inline pills with icon + text
- Color coding: Red (down), Green (up), Yellow (setup), Gray (idle)
- Icons from Heroicons

### Data Display
- Tables: Striped rows (alternating backgrounds), sticky headers
- Charts: Embedded using chart library, consistent height (h-64 to h-96)
- Metrics: Large numbers with small labels, monospace for precision

---

## Industrial Design Considerations

**Clarity Over Decoration:**
- Minimal animations (only status changes, no scroll effects)
- High contrast for readability in factory lighting
- No hero images—focus on functional interfaces
- Straightforward navigation, no marketing elements

**Touch-Friendly:**
- All interactive elements minimum 48px height
- Generous spacing around clickable areas
- Large form controls on operator interface

**Professional Aesthetic:**
- Clean, corporate appearance
- Trust-building through clarity and consistency
- Data-first presentation
- No playful elements—serious industrial tone

---

## Icons
**Library:** Heroicons (via CDN)
**Key Icons:**
- Status: ArrowDown, ArrowUp, Clock, CheckCircle
- Reasons: Wrench, Cube, Cog, Lightning Bolt
- Navigation: Home, ChartBar, DocumentText, Cog (settings)

---

## Images
**None Required** - This is a pure functional dashboard. All visual communication through data visualization, status indicators, and typography. No hero sections or decorative imagery.