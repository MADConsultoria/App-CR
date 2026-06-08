---
name: Construction & Growth
colors:
  surface: '#101417'
  surface-dim: '#101417'
  surface-bright: '#363a3d'
  surface-container-lowest: '#0b0f12'
  surface-container-low: '#181c1f'
  surface-container: '#1c2023'
  surface-container-high: '#262a2e'
  surface-container-highest: '#313538'
  on-surface: '#e0e3e7'
  on-surface-variant: '#dbc2b2'
  inverse-surface: '#e0e3e7'
  inverse-on-surface: '#2d3134'
  outline: '#a28c7e'
  outline-variant: '#554337'
  surface-tint: '#ffb780'
  primary: '#ffb780'
  on-primary: '#4e2600'
  primary-container: '#e48530'
  on-primary-container: '#542900'
  inverse-primary: '#924c00'
  secondary: '#b7c9d4'
  on-secondary: '#21333b'
  secondary-container: '#3a4c55'
  on-secondary-container: '#a9bbc6'
  tertiary: '#b9c9d4'
  on-tertiary: '#24323b'
  tertiary-container: '#8f9fa9'
  on-tertiary-container: '#27363f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc4'
  primary-fixed-dim: '#ffb780'
  on-primary-fixed: '#2f1400'
  on-primary-fixed-variant: '#6f3800'
  secondary-fixed: '#d2e5f1'
  secondary-fixed-dim: '#b7c9d4'
  on-secondary-fixed: '#0c1e26'
  on-secondary-fixed-variant: '#384952'
  tertiary-fixed: '#d5e5f0'
  tertiary-fixed-dim: '#b9c9d4'
  on-tertiary-fixed: '#0e1d25'
  on-tertiary-fixed-variant: '#3a4952'
  background: '#101417'
  on-background: '#e0e3e7'
  surface-variant: '#313538'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
---

## Brand & Style
This design system is engineered for a house construction mentoring platform centered on the "Build to Sell" philosophy. The brand personality is **authoritative, industrious, and high-stakes**. It balances the raw energy of a construction site with the polished professionalism of a real estate investment firm.

The visual style is **Modern Corporate with Industrial influences**. It prioritizes structural integrity through the use of solid shapes, architectural alignment, and high-contrast boundaries. The emotional goal is to instill confidence in the user, making complex construction processes feel manageable, structured, and profitable.

## Colors
The palette is rooted in the materials of the trade. 
- **Primary (Construction Orange):** Used for primary actions, progress indicators, and critical brand moments. It represents activity and safety.
- **Secondary (Steel Grey):** Used for supporting UI elements, iconography, and secondary navigation.
- **Neutral (Dark Slate):** The foundational surface color. It provides a "blueprint" feel and ensures that orange accents have maximum visibility.
- **High Contrast:** Pure White (#FFFFFF) is reserved for primary body text and high-level headings to ensure accessibility against dark backgrounds. Pure Black (#000000) is used sparingly for deep shadows or heavy borders.

## Typography
The typography system uses a combination of **Hanken Grotesk** for headlines and **Inter** for functional text. 

**Hanken Grotesk** provides a sharp, contemporary geometric feel that mimics architectural lettering. It should be used for large displays and section headers to establish a strong hierarchy. 

**Inter** is utilized for body copy, data tables, and input fields. Its high legibility and neutral tone are essential for technical documentation and financial breakdowns. Use `label-caps` for metadata, table headers, and small UI descriptors to maintain an organized, industrial aesthetic.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to mirror the precision of a blueprint. 
- **Desktop:** 12-column grid with a max-width of 1280px.
- **Tablet:** 8-column fluid grid with 24px margins.
- **Mobile:** 4-column fluid grid with 16px margins.

Spacing follows a strict **8px base unit**. Gaps between related components should be `md` (16px), while major section breaks should use `xl` (48px) to provide visual breathing room and prevent the interface from feeling cluttered. Alignment should always be "hard-edged"—elements should snap to the grid to reinforce the feeling of stability.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Bold Borders** rather than traditional soft shadows. 

1.  **Level 0 (Base):** Dark Slate (#1A1E21) used for the main application background.
2.  **Level 1 (Cards/Panels):** Surface Slate (#3F4E57) with a 1px solid border (#6F818B). 
3.  **Level 2 (Modals/Popovers):** A slightly lighter tint of Slate with a primary-colored top border (2px) to denote focus.

Borders are the primary tool for separation. Use high-contrast borders between sections to simulate the "framing" of a house. Avoid blurs; prefer crisp, solid lines.

## Shapes
This design system utilizes **Soft (0.25rem)** roundedness. While pure sharp corners feel too aggressive, overly rounded corners feel too "tech-startup" and soft. 

A subtle 4px radius (Level 1) is applied to buttons, cards, and input fields. This mimics the slightly eased edges of finished lumber or machined metal—retaining a sense of strength and solidity while feeling refined and modern.

## Components
- **Buttons:** Primary buttons are solid Orange (#E48530) with white bold text. Secondary buttons use a transparent background with a 2px Steel Grey border.
- **Input Fields:** Use the Dark Slate background with a 1px Steel Grey border. On focus, the border changes to Orange. Labels are always placed above the field in `label-caps`.
- **Cards:** Defined by a solid 1px border. Headlines within cards should be Hanken Grotesk. Use "Header Ribbons" (a solid 4px orange strip at the top) for featured project cards.
- **Chips/Status:** Use rectangular shapes with minimal rounding. Status colors (Success/Error) should be high-saturation to stand out against the dark backgrounds.
- **Progress Bars:** Representing construction phases, these should be thick (8px+) and use the Primary Orange for the fill, with a textured "striped" pattern for pending states.
- **Data Tables:** High-density with clear horizontal dividers. Use Steel Grey for row lines to maintain a structured, spreadsheet-like efficiency.