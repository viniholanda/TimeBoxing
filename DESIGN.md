# Design System: TimeBoxing App
**Project ID:** timeboxing-v1

## 1. Visual Theme & Atmosphere
The TimeBoxing app follows a **Utilitarian yet Premium** aesthetic. It prioritizes information density (especially in the backlog) while maintaining a clean, modern feel through the use of soft gradients, subtle shadows, and a sophisticated color palette. The atmosphere is meant to be **Focus-oriented**, avoiding distractions while providing immediate feedback on progress.

## 2. Color Palette & Roles
The system uses a semantic color naming convention based on HSL values for seamless theme switching.

*   **Primary (Text/Action):** Deep Midnight Blue (#1A1F2C in dark / #0F172A in light). Used for main headings and interactive elements.
*   **Secondary (Surface):** Soft Slate Gray (#F8FAFC). Used for background panels and neutral badges.
*   **Accent (Focus):** Vibrant Indigo-Blue (#3B82F6). Used for active tasks and progress indicators.
*   **Success (Productivity):** Emerald Green (#10B981). Used for completed tasks and celebratory indicators.
*   **Warning (Streak/Active):** Amber Orange (#F59E0B). Used for streaks and the flame icon.
*   **Background:** Clean White (#FFFFFF in light) or Deep Space Black (#0F172A in dark).

## 3. Typography Rules
*   **Font Family:** 'Inter', system-ui, sans-serif. Highly readable for data-dense interfaces.
*   **Weight Usage:**
    *   **Bold (700):** Main titles and large stat numbers.
    *   **Medium (500):** Task titles and sub-headings.
    *   **Normal (400):** Body text and time labels.
*   **Scale:** Range from `text-[10px]` for ultra-compact meta-data to `text-3xl` for impact stats.

## 4. Component Stylings
*   **Buttons:** Softly rounded (`rounded-xl` or `rounded-md`), using ghost variants for secondary actions to reduce visual noise.
*   **Cards/Containers:** Mostly `rounded-lg` (0.625rem). In the backlog, items are `rounded-sm` for maximum density. 
*   **Gradients:** Subtle `to-br` (top-right to bottom-right) gradients are used on stat cards to add depth.
*   **Glassmorphism:** Navigation and headers use `backdrop-blur-sm` for a modern, layered feel.

## 5. Layout Principles
*   **Grid System:** Uses a 12-column grid layout for desktop, collapsing to a single column on mobile.
*   **Density Strategy:** High density in the Backlog (20px items), standard density in the Timeline (60px per hour).
*   **Whitespace:** Generous padding in header and dashboard to balance the dense task lists below.
