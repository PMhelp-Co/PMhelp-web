# PMHelp Back-Office - PMHelp Theme Redesign Guide

## 🎯 Overview

This guide provides detailed instructions for redesigning the PMHelp Back-Office to match PMHelp's brand theme while maintaining its unique admin-focused identity. The redesign incorporates PMHelp's signature purple gradient colors, Satoshi typography, soft shadows, and smooth hover effects.

---

## 🎨 PMHelp Brand Design System Analysis

### Primary Colors (From PMHelp Website)

**Purple Gradient Palette:**
- **Primary Purple Start:** `#7e22ce` (Violet-600)
- **Primary Purple End:** `#9333ea` (Violet-500)
- **Primary Purple Dark:** `#6b21a8` (Violet-700) - Hover state
- **Primary Purple Darker:** `#742194` - Accent/borders
- **Primary Purple Light:** `#4C1D95` - Links
- **Primary Purple Lighter:** `#3B1674` - Link hover

**Gradient Pattern:**
```css
background: linear-gradient(to right, #7e22ce, #9333ea);
/* Hover gradient: */
background: linear-gradient(to right, #6b21a8, #7e22ce);
```

**Gray Scale (Neutral Colors):**
- **Gray-900:** `#101828` - Primary text
- **Gray-800:** `#1d2939` - Secondary text
- **Gray-700:** `#344054` - Body text
- **Gray-600:** `#475467` - Secondary text
- **Gray-500:** `#667085` - Muted text
- **Gray-300:** `#d0d5dd` - Borders
- **Gray-200:** `#eaecf0` - Light borders
- **Gray-100:** `#f2f4f7` - Backgrounds
- **Gray-50:** `#f9fafb` - Light backgrounds

### Typography

**Font Family:**
- **Primary:** `Satoshi, sans-serif` (Custom font - ensure fonts are loaded)
- **Fallback:** System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

**Font Sizes:**
- **H1:** `1.875rem` (30px) - Page titles
- **H2:** `1.5rem` (24px) - Section headers
- **H3:** `1.125rem` (18px) - Card titles
- **Body:** `0.9375rem` (15px) - Default text
- **Small:** `0.875rem` (14px) - Labels, secondary text
- **Tiny:** `0.75rem` (12px) - Badges, metadata

**Font Weights:**
- **700 (Bold):** Headings, important numbers
- **600 (Semi-bold):** Button text, tab labels
- **500 (Medium):** Labels, links
- **400 (Regular):** Body text

### Shadow System (PMHelp Style)

**Soft Shadows:**
```css
/* Small shadow - Cards, inputs */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Medium shadow - Hover states, elevated cards */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

/* Large shadow - Modals, overlays */
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

/* Focus ring (purple) */
box-shadow: 0 0 0 3px rgba(126, 34, 206, 0.1);
```

### Hover Effects (PMHelp Style)

**Card Hover:**
```css
transition: all 0.2s ease;
transform: translateY(-2px);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
```

**Button Hover:**
```css
transition: all 0.2s ease;
transform: scale(1.02);
/* For gradient buttons, also change gradient */
```

**Button Active:**
```css
transform: scale(0.98);
```

**Link Hover:**
```css
color: #6b21a8; /* Darker purple */
transition: color 0.2s ease;
```

### Border Radius

- **Full Rounded:** `9999px` (for buttons, badges)
- **Medium Rounded:** `0.5rem` (8px) - Cards, inputs
- **Small Rounded:** `0.375rem` (6px) - Small elements

---

## 📐 CSS Variables Update

### Update `backoffice/css/backoffice.css` - CSS Variables Section

Replace the existing color variables with PMHelp's brand colors:

```css
:root {
  /* PMHelp Primary Colors */
  --pmhelp-purple-start: #7e22ce;
  --pmhelp-purple-end: #9333ea;
  --pmhelp-purple-dark: #6b21a8;
  --pmhelp-purple-accent: #742194;
  --pmhelp-purple-link: #4C1D95;
  --pmhelp-purple-link-hover: #3B1674;
  
  /* Primary Color (for backward compatibility) */
  --primary-color: #7e22ce;
  --primary-hover: #6b21a8;
  --primary-gradient: linear-gradient(to right, #7e22ce, #9333ea);
  --primary-gradient-hover: linear-gradient(to right, #6b21a8, #7e22ce);
  
  /* Gray Scale */
  --gray-900: #101828;
  --gray-800: #1d2939;
  --gray-700: #344054;
  --gray-600: #475467;
  --gray-500: #667085;
  --gray-300: #d0d5dd;
  --gray-200: #eaecf0;
  --gray-100: #f2f4f7;
  --gray-50: #f9fafb;
  
  /* Semantic Colors */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f2f4f7;
  
  /* Text Colors */
  --text-primary: #101828;
  --text-secondary: #344054;
  --text-muted: #667085;
  
  /* Border Colors */
  --border-color: #eaecf0;
  --border-color-dark: #d0d5dd;
  
  /* Shadow System (PMHelp Style) */
  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-soft-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.15);
  --shadow-focus: 0 0 0 3px rgba(126, 34, 206, 0.1);
  
  /* Border Radius */
  --border-radius: 0.5rem;
  --border-radius-full: 9999px;
  --border-radius-sm: 0.375rem;
  
  /* Spacing (keep existing) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

---

## 🔤 Typography Update

### Update Font Family

Replace system fonts with Satoshi (ensure fonts are loaded):

```css
/* Base Typography */
body {
  font-family: Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.9375rem; /* 15px */
  line-height: 1.6;
  color: var(--text-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

h1 {
  font-size: 1.875rem; /* 30px */
}

h2 {
  font-size: 1.5rem; /* 24px */
}

h3 {
  font-size: 1.125rem; /* 18px */
}
```

**Note:** If Satoshi font files are not available in the backoffice, use the fallback system fonts. The font files are in `fonts/` directory - ensure they're accessible or use web fonts.

---

## 🎨 Component-by-Component Redesign Instructions

### 1. Login Page (`login.html`)

#### Color Updates
- **Background:** `--bg-secondary` (#f9fafb)
- **Card Background:** `--bg-primary` (white)
- **Card Border:** `--border-color` (#eaecf0)
- **Card Shadow:** `--shadow-soft-lg` (0 4px 16px rgba(0, 0, 0, 0.12))

#### Button Styling
```css
.btn-primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1.5rem; /* 11px 24px */
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background: var(--primary-gradient-hover);
  transform: scale(1.02);
  box-shadow: var(--shadow-soft-lg);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus {
  outline: none;
  box-shadow: var(--shadow-soft), var(--shadow-focus);
}
```

#### Input Styling
```css
input[type="email"],
input[type="password"] {
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1rem;
  font-size: 0.875rem;
  transition: all var(--transition-base);
}

input:focus {
  outline: none;
  border-color: var(--pmhelp-purple-start);
  box-shadow: var(--shadow-focus);
}
```

#### Card Hover Effect
```css
.login-card {
  transition: all var(--transition-base);
  box-shadow: var(--shadow-soft-lg);
}

.login-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

---

### 2. Dashboard Header

#### Header Styling
```css
.backoffice-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-soft);
  padding: 1rem 2rem;
}

.backoffice-header h1 {
  color: var(--pmhelp-purple-start);
  font-weight: 700;
  font-size: 1.5rem;
}
```

#### Logout Button
```css
.btn-logout {
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 0.5rem 1rem;
  transition: all var(--transition-base);
}

.btn-logout:hover {
  color: var(--pmhelp-purple-start);
  border-color: var(--pmhelp-purple-start);
  background: rgba(126, 34, 206, 0.05);
}
```

---

### 3. Tab Navigation

#### Tab Button Styling
```css
.tab-button {
  color: var(--text-secondary);
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all var(--transition-base);
  position: relative;
}

.tab-button:hover {
  color: var(--pmhelp-purple-start);
  background: rgba(126, 34, 206, 0.05);
}

.tab-button.active {
  color: var(--pmhelp-purple-start);
  border-bottom-color: var(--pmhelp-purple-start);
  font-weight: 600;
}
```

---

### 4. Stat Cards (Analytics Dashboard)

#### Card Base Styling with Hover
```css
.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
  cursor: default;
}

.stat-card:hover {
  box-shadow: var(--shadow-soft-lg);
  transform: translateY(-2px);
  border-color: var(--pmhelp-purple-start);
}
```

#### Stat Value Styling
```css
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--pmhelp-purple-start);
  margin-top: 0.5rem;
}
```

#### Stat Label Styling
```css
.stat-card h3 {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
```

---

### 5. Tables

#### Table Styling
```css
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

thead {
  background: var(--bg-tertiary);
}

thead th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border-color);
}

tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-base);
}

tbody tr:hover {
  background: rgba(126, 34, 206, 0.03);
  transform: translateX(2px);
}

tbody td {
  padding: 1rem;
  color: var(--text-primary);
  font-size: 0.9375rem;
}
```

---

### 6. Buttons (All Variants)

#### Primary Button (Gradient)
```css
.btn-primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-gradient-hover);
  transform: scale(1.02);
  box-shadow: var(--shadow-soft-lg);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus {
  outline: none;
  box-shadow: var(--shadow-soft), var(--shadow-focus);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--pmhelp-purple-start);
  color: var(--pmhelp-purple-start);
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft-lg);
}
```

#### Warning Button
```css
.btn-warning {
  background: var(--warning-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.btn-warning:hover {
  background: #d97706;
  transform: scale(1.02);
  box-shadow: var(--shadow-soft-lg);
}
```

#### Danger Button
```css
.btn-danger {
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  padding: 0.6875rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.btn-danger:hover {
  background: #dc2626;
  transform: scale(1.02);
  box-shadow: var(--shadow-soft-lg);
}
```

---

### 7. Form Elements

#### Input Fields
```css
input[type="text"],
input[type="email"],
input[type="url"],
input[type="datetime-local"],
textarea {
  width: 100%;
  padding: 0.6875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9375rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all var(--transition-base);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--pmhelp-purple-start);
  box-shadow: var(--shadow-focus);
}

input:hover,
textarea:hover {
  border-color: var(--border-color-dark);
}
```

#### Labels
```css
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}
```

#### Checkbox/Toggle
```css
input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--pmhelp-purple-start);
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: var(--border-color);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-base);
  cursor: pointer;
}

.toggle-switch.active {
  background: var(--pmhelp-purple-start);
}

.toggle-switch .slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-soft);
}

.toggle-switch.active .slider {
  transform: translateX(1.5rem);
}
```

---

### 8. Search Section

#### Search Input with Hover
```css
.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.6875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-full);
  font-size: 0.9375rem;
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--pmhelp-purple-start);
  box-shadow: var(--shadow-focus);
}

.search-input:hover {
  border-color: var(--border-color-dark);
}
```

---

### 9. Search Results

#### Result Items with Hover
```css
.search-results {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.result-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-base);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(126, 34, 206, 0.05);
  transform: translateX(4px);
  border-left: 3px solid var(--pmhelp-purple-start);
  padding-left: calc(1.5rem - 3px);
}
```

---

### 10. User Details Card

#### Card with Hover Effect
```css
.user-details {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.user-details:hover {
  box-shadow: var(--shadow-soft-lg);
  border-color: var(--pmhelp-purple-start);
}
```

#### Info Grid
```css
.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0;
}

.info-item span {
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 500;
}
```

---

### 11. Banner Management Form

#### Banner Card with Hover
```css
.banner-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.banner-item:hover {
  box-shadow: var(--shadow-soft-lg);
  border-color: var(--pmhelp-purple-start);
  transform: translateY(-2px);
}
```

#### Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.active {
  background: var(--success-color);
  color: white;
}

.status-badge.inactive {
  background: var(--text-muted);
  color: white;
}
```

---

### 12. Chart Section

#### Chart Container
```css
.chart-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-base);
}

.chart-section:hover {
  box-shadow: var(--shadow-soft-lg);
}
```

#### Chart Controls (Period Buttons)
```css
.chart-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.chart-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-base);
  cursor: pointer;
}

.chart-controls button:hover {
  border-color: var(--pmhelp-purple-start);
  color: var(--pmhelp-purple-start);
  background: rgba(126, 34, 206, 0.05);
}

.chart-controls button.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-soft);
}

.chart-controls button.active:hover {
  background: var(--primary-gradient-hover);
  transform: scale(1.02);
}
```

---

### 13. Loading Overlay

#### Overlay Styling
```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(126, 34, 206, 0.2);
  border-top-color: var(--pmhelp-purple-start);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 14. Toast Notifications

#### Toast Styling
```css
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 10000;
  animation: slideUp 0.3s ease;
  max-width: 400px;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast.success {
  background: var(--success-color);
  color: white;
}

.toast.error {
  background: var(--danger-color);
  color: white;
}

.toast.warning {
  background: var(--warning-color);
  color: white;
}

.toast.info {
  background: var(--pmhelp-purple-start);
  color: white;
}
```

---

## 🎯 Implementation Checklist

### CSS Variables Update
- [ ] Replace all color variables with PMHelp brand colors
- [ ] Update shadow variables to PMHelp style
- [ ] Update border radius variables
- [ ] Add transition variables

### Typography
- [ ] Update font-family to Satoshi (with fallbacks)
- [ ] Update font sizes to match PMHelp scale
- [ ] Update font weights

### Components to Update

#### Login Page
- [ ] Update background colors
- [ ] Update button styling (gradient)
- [ ] Update input styling (rounded-full)
- [ ] Add card hover effect
- [ ] Update focus states

#### Dashboard
- [ ] Update header styling
- [ ] Update tab navigation (purple active state)
- [ ] Update stat cards (hover effect, purple values)
- [ ] Update tables (hover rows)
- [ ] Update all buttons (gradient primary)

#### Forms
- [ ] Update input styling
- [ ] Update labels
- [ ] Update checkboxes/toggles
- [ ] Update form cards (hover effect)

#### Search & Results
- [ ] Update search input (rounded-full)
- [ ] Update result items (hover effect with purple accent)

#### User Details
- [ ] Update card styling (hover effect)
- [ ] Update info grid
- [ ] Update action buttons

#### Banner Management
- [ ] Update banner card (hover effect)
- [ ] Update status badge (purple/green)
- [ ] Update form elements

#### Charts
- [ ] Update chart container (hover effect)
- [ ] Update period buttons (gradient active state)

#### Utilities
- [ ] Update loading overlay
- [ ] Update toast notifications
- [ ] Add smooth transitions everywhere

---

## 🎨 Design Principles to Maintain

1. **PMHelp Purple Identity:** Use purple gradients for primary actions
2. **Soft Shadows:** Use PMHelp's shadow system (soft, not harsh)
3. **Smooth Hover Effects:** Subtle transforms and shadow transitions
4. **Rounded Elements:** Full rounded buttons, medium rounded cards
5. **Professional Admin Feel:** Clean, functional, but branded
6. **Consistent Spacing:** Use the spacing system consistently
7. **Accessibility:** Maintain high contrast, focus states

---

## 📝 Notes

1. **Font Loading:** Ensure Satoshi font files are accessible. If not, system fonts will be used as fallback.

2. **Gradient Support:** All modern browsers support CSS gradients. For older browsers, fallback to solid `#7e22ce`.

3. **Hover Effects:** Only apply hover effects to interactive elements (cards, buttons, links). Don't add hover to static text.

4. **Performance:** Use `transform` and `opacity` for animations (GPU-accelerated). Avoid animating `width`, `height`, `margin`, `padding`.

5. **Shadow Layering:** Use softer shadows for cards, larger shadows for modals/overlays.

6. **Purple Accents:** Use purple sparingly for accents. Don't overuse - maintain the professional admin feel.

---

## 🚀 Quick Reference: Color Mapping

| Current Backoffice | PMHelp Brand |
|-------------------|--------------|
| `--primary-color: #2563eb` | `#7e22ce` (gradient to `#9333ea`) |
| `--text-primary: #1e293b` | `#101828` |
| `--text-secondary: #64748b` | `#344054` |
| `--border-color: #e2e8f0` | `#eaecf0` |
| `--bg-secondary: #f8fafc` | `#f9fafb` |
| `--shadow-sm` | `0 2px 8px rgba(0, 0, 0, 0.08)` |
| `--shadow-md` | `0 4px 16px rgba(0, 0, 0, 0.12)` |

---

**Last Updated:** After PMHelp theme analysis
**Purpose:** Complete redesign guide for PMHelp-branded backoffice
