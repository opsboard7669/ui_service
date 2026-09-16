# OpsBoard UI Design System

## Overview

This design system defines the visual language for the OpsBoard application. All UI components and pages must follow these guidelines to ensure visual consistency across the entire application.

## Color Palette

### Primary Colors (Green Accent)
- **Primary 50**: `#f0fdf4`
- **Primary 100**: `#dcfce7`
- **Primary 200**: `#bbf7d0`
- **Primary 300**: `#86efac` (Main accent)
- **Primary 400**: `#4ade80` (Main accent)
- **Primary 500**: `#22c55e` (Main accent)
- **Primary 600**: `#16a34a`
- **Primary 700**: `#15803d`
- **Primary 800**: `#166534`
- **Primary 900**: `#14532d`

### Background Colors
- **Primary Background**: `#0a0a0f` (Main page background)
- **Secondary Background**: `#0f0f14`
- **Tertiary Background**: `#16161f`
- **Card Background**: `#0a0a0f`
- **Input Background**: `#000000`

### Glass Card Backgrounds
- **Glass Card Base**: `rgba(18, 18, 24, 0.9)`
- **Glass Card Hover**: `rgba(22, 22, 28, 0.95)`
- **Glass Surface**: `rgba(22, 22, 28, 0.95)`
- **Navbar Glass**: `rgba(12, 12, 18, 0.9)`
- **Card Inner**: `#161B22`

### Text Colors
- **Primary Text**: `#ffffff`
- **Secondary Text**: `#888888`
- **Muted Text**: `#666666`
- **Label Text**: `rgba(220, 220, 220, 0.9)`
- **Placeholder Text**: `rgba(136, 136, 136, 0.7)`

### Border Colors
- **Primary Border**: `rgba(255, 255, 255, 0.08)`
- **Secondary Border**: `rgba(255, 255, 255, 0.12)`
- **Tertiary Border**: `rgba(255, 255, 255, 0.16)`
- **Hover Border**: `rgba(255, 255, 255, 0.2)`
- **Focus Border (Green)**: `rgba(134, 239, 172, 0.5)`
- **Error Border**: `rgba(239, 68, 68, 0.5)`
- **Success Border**: `rgba(34, 197, 94, 0.5)`

### Semantic Colors
- **Success**: `#22c55e`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #86efac, #4ade80)`
- **Primary Gradient Hover**: `linear-gradient(135deg, #a7f3d0, #86efac)`
- **Logo Gradient**: `linear-gradient(90deg, #86efac, #4ade80, #22c55e, #86efac)`
- **Shimmer Gradient**: `linear-gradient(90deg, #ffffff 0%, #22c55e 25%, #ffffff 50%, #22c55e 75%, #ffffff 100%)`

## Typography

### Font Family
- **Primary**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Font Sizes
- **XS**: `0.75rem` (12px)
- **SM**: `0.8125rem` (13px)
- **Base**: `0.875rem` (14px)
- **MD**: `1rem` (16px)
- **LG**: `1.125rem` (18px)
- **XL**: `1.25rem` (20px)
- **2XL**: `1.5rem` (24px)
- **3XL**: `1.875rem` (30px)

### Font Weights
- **Normal**: `400`
- **Medium**: `500`
- **Semibold**: `600`
- **Bold**: `700`

### Line Heights
- **Tight**: `1.2`
- **Normal**: `1.5`
- **Relaxed**: `1.75`

### Letter Spacing
- **Heading XL**: `-0.025em`
- **Heading LG**: `-0.02em`
- **Heading MD**: `-0.01em`
- **Base**: `-0.02em`

## Spacing

- **XS**: `0.25rem` (4px)
- **SM**: `0.5rem` (8px)
- **MD**: `0.75rem` (12px)
- **LG**: `1rem` (16px)
- **XL**: `1.5rem` (24px)
- **2XL**: `2rem` (32px)
- **3XL**: `3rem` (48px)
- **4XL**: `4rem` (64px)

## Border Radius

- **SM**: `6px`
- **MD**: `10px`
- **LG**: `14px`
- **XL**: `16px`
- **2XL**: `20px`
- **Full**: `9999px`

## Shadows

### Standard Shadows
- **XS**: `0 1px 3px rgba(0, 0, 0, 0.12)`
- **SM**: `0 1px 3px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)`
- **MD**: `0 2px 6px rgba(0, 0, 0, 0.16), 0 6px 16px rgba(0, 0, 0, 0.12)`
- **LG**: `0 4px 12px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.12)`
- **XL**: `0 8px 24px rgba(0, 0, 0, 0.16), 0 12px 32px rgba(0, 0, 0, 0.12)`

### Primary (Green) Shadows
- **SM**: `0 1px 3px rgba(134, 239, 172, 0.2), 0 2px 8px rgba(134, 239, 172, 0.15)`
- **MD**: `0 2px 6px rgba(134, 239, 172, 0.3), 0 6px 16px rgba(134, 239, 172, 0.25)`
- **LG**: `0 4px 12px rgba(134, 239, 172, 0.3), 0 8px 24px rgba(134, 239, 172, 0.25)`

### Glass Card Shadow
- **Base**: `0 1px 3px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05)`
- **Hover**: `0 2px 6px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(0, 0, 0, 0.15), 0 12px 32px rgba(0, 0, 0, 0.1)`

### Card Hover Shadow (Indigo)
- **Hover**: `0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(99, 102, 241, 0.15)`

### Modal Shadow
- **Base**: `0 8px 32px rgba(0, 0, 0, 0.5)`
- **Hover**: `0 20px 60px rgba(0, 0, 0, 0.45)`

### Notification Badge Shadow
- **Base**: `0 2px 8px rgba(134, 239, 172, 0.4)`
- **Hover**: `0 4px 12px rgba(134, 239, 172, 0.5)`

## Glass Effects

### Blur Values
- **SM**: `8px`
- **MD**: `12px`
- **LG**: `20px`
- **XL**: `30px`
- **2XL**: `40px`

### Glass Card
- **Background**: `rgba(18, 18, 24, 0.9)`
- **Backdrop Filter**: `blur(20px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius**: `14px`

### Glass Surface
- **Background**: `rgba(22, 22, 28, 0.95)`
- **Backdrop Filter**: `blur(30px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`

### Navbar Glass
- **Background**: `rgba(12, 12, 18, 0.9)`
- **Backdrop Filter**: `blur(30px)`
- **Border Bottom**: `1px solid rgba(255, 255, 255, 0.1)`

### Dropdown Glass
- **Background**: `rgba(15, 15, 22, 0.95)`
- **Backdrop Filter**: `blur(24px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`

### Modal Glass
- **Background**: `rgba(10, 10, 15, 0.95)`
- **Backdrop Filter**: `blur(32px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`

### Notification Panel Glass
- **Background**: `rgba(15, 18, 28, 0.72)`
- **Backdrop Filter**: `blur(18px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`

## Opacity Values

- **Disabled**: `0.5`
- **Hover**: `0.8`
- **Focus**: `0.9`
- **Border Base**: `0.08`
- **Border Secondary**: `0.12`
- **Border Tertiary**: `0.16`
- **Border Hover**: `0.2`
- **Border Focus**: `0.5`
- **Glass Card Base**: `0.9`
- **Glass Card Hover**: `0.95`
- **Glass Surface**: `0.95`
- **Navbar Glass**: `0.9`
- **Dropdown Glass**: `0.95`
- **Modal Glass**: `0.95`
- **Notification Panel Glass**: `0.72`

## Transitions

### Durations
- **Fast**: `150ms`
- **Base**: `200ms`
- **Slow**: `300ms`
- **Slower**: `400ms`

### Timing Functions
- **Ease**: `ease`
- **Ease In**: `ease-in`
- **Ease Out**: `ease-out`
- **Ease In Out**: `ease-in-out`

### Default Transition
- **Button**: `all 0.2s ease`
- **Card Hover**: `box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease`
- **Input**: `all 0.2s ease`
- **Dropdown Item**: `all 0.2s ease`

## Hover States

### Buttons
- **Gradient Button**: Transform `translateY(-2px)`, enhanced shadow
- **Outline Button**: Background `rgba(255, 255, 255, 0.08)`, border `rgba(255, 255, 255, 0.25)`
- **Contact Button**: Background `rgba(134, 239, 172, 0.15)`, border `rgba(134, 239, 172, 0.4)`

### Cards
- **Glass Card**: Background `rgba(22, 22, 28, 0.95)`, border `rgba(255, 255, 255, 0.15)`, enhanced shadow
- **Card Hover**: Indigo glow effect, background `rgba(255, 255, 255, 0.03)`

### Inputs
- **Input Field**: Border `rgba(255, 255, 255, 0.2)`, background `rgba(18, 18, 24, 0.95)`

### Dropdowns
- **User Menu Trigger**: Background `rgba(255, 255, 255, 0.08)`, border `rgba(255, 255, 255, 0.18)`
- **Category Dropdown Trigger**: Background `rgba(255, 255, 255, 0.08)`, border `rgba(255, 255, 255, 0.2)`

## Focus States

### Focus Ring
- **Color**: `rgba(134, 239, 172, 0.6)`
- **Width**: `2px solid`
- **Offset**: `2px`

### Input Focus
- **Border**: `rgba(134, 239, 172, 0.5)`
- **Shadow**: `0 0 0 3px rgba(134, 239, 172, 0.15)`

### Error Focus
- **Border**: `rgba(239, 68, 68, 0.5)`
- **Shadow**: `0 0 0 3px rgba(239, 68, 68, 0.15)`

### Success Focus
- **Border**: `rgba(34, 197, 94, 0.5)`
- **Shadow**: `0 0 0 3px rgba(34, 197, 94, 0.15)`

## Active States

### Buttons
- **Transform**: `scale(0.98)`

## Disabled States

### Buttons
- **Opacity**: `0.5`
- **Cursor**: `not-allowed`

## Scrollbar Styling

### Webkit Scrollbar
- **Width**: `6px`
- **Height**: `6px`
- **Track**: `transparent`
- **Thumb**: `rgba(255, 255, 255, 0.15)`
- **Thumb Border Radius**: `3px`
- **Thumb Hover**: `rgba(255, 255, 255, 0.25)`

### Custom Scrollbar (Notification Panel)
- **Width**: `4px`
- **Track**: `transparent`
- **Thumb**: `rgba(255, 255, 255, 0.15)`
- **Thumb Border Radius**: `2px`
- **Thumb Hover**: `rgba(255, 255, 255, 0.25)`

### Firefox Scrollbar
- **Width**: `thin`
- **Color**: `rgba(255, 255, 255, 0.15) transparent`

## Selection Styling

- **Background**: `rgba(134, 239, 172, 0.3)`
- **Color**: `#ffffff`

## Animations

### Fade In
- **Duration**: `0.5s ease`
- **From**: `opacity: 0, transform: translateY(16px)`
- **To**: `opacity: 1, transform: translateY(0)`

### Pulse Glow
- **Duration**: `2s ease-in-out infinite`
- **0%, 100%**: `box-shadow: 0 0 6px rgba(134, 239, 172, 0.15)`
- **50%**: `box-shadow: 0 0 16px rgba(134, 239, 172, 0.25)`

### Logo Gradient Cycle
- **Duration**: `4s linear infinite`
- **Background Size**: `300% 100%`

### Logo Pulse
- **Duration**: `3s ease-in-out infinite`
- **0%, 100%**: `filter: drop-shadow(0 0 4px rgba(134, 239, 172, 0.25))`
- **50%**: `filter: drop-shadow(0 0 10px rgba(134, 239, 172, 0.4))`

### Navbar Border Flow
- **Duration**: `4s linear infinite`
- **Background Size**: `300% 100%`

### Shimmer
- **Duration**: `3s ease-in-out infinite`
- **Background Size**: `200% 100%`

### Heading Entrance
- **Duration**: `1s cubic-bezier(0.34, 1.56, 0.64, 1)`
- **From**: `opacity: 0, transform: rotateY(90deg) scale(0.8)`
- **To**: `opacity: 1, transform: rotateY(0deg) scale(1)`

### Gradient Shift
- **Duration**: `20s ease-in-out infinite`
- **Background Size**: `200% 200%`

### Float Glow
- **Duration**: `15s ease-in-out infinite`

### Grid Drift
- **Duration**: `60s linear infinite`

### Breathe
- **Duration**: `3s ease-in-out infinite`
- **0%, 100%**: `transform: scale(1), box-shadow: 0 0 0 0 rgba(34, 197, 94, 0)`
- **50%**: `transform: scale(1.01), box-shadow: 0 0 20px 0 rgba(34, 197, 94, 0.1)`

### Fade In Up
- **Duration**: `0.6s ease-out`
- **From**: `opacity: 0, transform: translateY(20px)`
- **To**: `opacity: 1, transform: translateY(0)`

### Slide Down
- **Duration**: `220ms ease-out`
- **From**: `opacity: 0, transform: translateY(-12px)`
- **To**: `opacity: 1, transform: translateY(0)`

### Slide Up
- **Duration**: `220ms ease-out`
- **From**: `opacity: 0, transform: translateY(100%)`
- **To**: `opacity: 1, transform: translateY(0)`

### Badge Pop
- **Duration**: `0.3s ease-out`
- **0%**: `transform: scale(1)`
- **50%**: `transform: scale(1.3)`
- **100%**: `transform: scale(1)`

### Card Hover
- **Duration**: `180ms ease-out`
- **From**: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)`
- **To**: `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(134, 239, 172, 0.1)`

## Z-Index Scale

- **Dropdown**: `50`
- **Sticky**: `100`
- **Modal Backdrop**: `200`
- **Modal**: `300`
- **Tooltip**: `400`
- **Notification**: `9999`

## Component-Specific Styles

### Glass Card
- **Background**: `rgba(18, 18, 24, 0.9)`
- **Backdrop Filter**: `blur(20px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Border Radius**: `14px`
- **Padding**: `1rem`
- **Shadow**: Glass card shadow
- **Transition**: `all 0.2s ease`

### Gradient Button
- **Background**: `linear-gradient(135deg, #86efac, #4ade80)`
- **Color**: `#1a1a1a`
- **Font Weight**: `600`
- **Padding**: `0.5rem 1rem`
- **Border Radius**: `10px`
- **Border**: `none`
- **Shadow**: Primary shadow SM
- **Transition**: `all 0.2s ease`

### Outline Button
- **Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Color**: `rgba(255, 255, 255, 0.9)`
- **Font Weight**: `600`
- **Padding**: `0.5rem 1rem`
- **Border Radius**: `10px`
- **Background**: `transparent`
- **Transition**: `all 0.2s ease`

### Input Field
- **Background**: `rgba(14, 14, 20, 0.9)`
- **Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Border Radius**: `10px`
- **Color**: `#ffffff`
- **Padding**: `0.5rem 0.75rem`
- **Font Size**: `0.8125rem`
- **Transition**: `all 0.2s ease`

### Select Field
- **Background**: `rgba(14, 14, 20, 0.9)`
- **Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Border Radius**: `10px`
- **Color**: `#ffffff`
- **Padding**: `0.5rem 0.75rem`
- **Font Size**: `0.8125rem`
- **Option Background**: `#1a1a24`
- **Transition**: `all 0.2s ease`

### User Menu
- **Trigger Background**: `rgba(255, 255, 255, 0.04)`
- **Trigger Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Trigger Border Radius**: `9999px`
- **Dropdown Background**: `rgba(15, 15, 22, 0.95)`
- **Dropdown Backdrop Filter**: `blur(24px)`
- **Dropdown Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Dropdown Border Radius**: `8px`
- **Dropdown Padding**: `0.25rem`
- **Dropdown Shadow**: `0 4px 20px rgba(0, 0, 0, 0.4)`

### Category Dropdown
- **Trigger Background**: `rgba(255, 255, 255, 0.04)`
- **Trigger Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Trigger Border Radius**: `6px`
- **Dropdown Background**: `rgba(15, 15, 22, 0.95)`
- **Dropdown Backdrop Filter**: `blur(24px)`
- **Dropdown Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Dropdown Border Radius**: `10px`
- **Dropdown Padding**: `0.25rem`
- **Dropdown Shadow**: `0 8px 32px rgba(0, 0, 0, 0.4)`

### Contact Modal
- **Backdrop Background**: `rgba(0, 0, 0, 0.6)`
- **Backdrop Blur**: `blur(4px)`
- **Card Background**: `rgba(10, 10, 15, 0.95)`
- **Card Backdrop Filter**: `blur(32px)`
- **Card Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Card Border Radius**: `16px`
- **Card Padding**: `1rem`
- **Card Shadow**: `0 8px 32px rgba(0, 0, 0, 0.5)`

### Notification Panel
- **Background**: `rgba(15, 18, 28, 0.72)`
- **Backdrop Filter**: `blur(18px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Border Radius**: `20px`
- **Shadow**: `0 20px 60px rgba(0, 0, 0, 0.45)`

### Notification Card
- **Background**: `rgba(255, 255, 255, 0.03)`
- **Border Radius**: `16px`
- **Padding**: `18px`
- **Transition**: `all 180ms ease-out`
- **Border**: `1px solid transparent`

### Notification Badge
- **Background**: `linear-gradient(135deg, #86efac, #4ade80)`
- **Shadow**: `0 2px 8px rgba(134, 239, 172, 0.4)`
- **Transition**: `all 0.2s ease`

## Page Background

### Base Background
- **Color**: `#000000`

### Page Shell Background
- **Gradient**: `linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)`
- **Radial Gradients**:
  - `radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)`
  - `radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)`
  - `radial-gradient(ellipse at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 60%)`

### Grid Pattern
- **Background Image**: 
  - `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)`
  - `linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`
- **Background Size**: `50px 50px`
- **Opacity**: `0.5`

## Logo Styling

### Logo Text
- **Background**: Logo gradient
- **Background Size**: `300% 100%`
- **Animation**: Logo gradient cycle + logo pulse
- **Filter**: `drop-shadow(0 0 6px rgba(134, 239, 172, 0.3))`
- **Hover Filter**: `drop-shadow(0 0 10px rgba(134, 239, 172, 0.5))`

### Logo Icon
- **Width**: `1.25rem`
- **Height**: `1.25rem`
- **Filter**: `drop-shadow(0 0 4px rgba(134, 239, 172, 0.4))`
- **Hover Filter**: `drop-shadow(0 0 8px rgba(134, 239, 172, 0.6))`

### Logo Wrapper
- **Transition**: `transform 0.2s ease`
- **Hover Transform**: `scale(1.02)`

## Premium Components

### Premium Glass Card
- **Background**: `rgba(10, 10, 10, 0.5)`
- **Backdrop Filter**: `blur(24px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.05)`
- **Border Radius**: `16px`
- **Padding**: `2rem`
- **Shadow**: `0 4px 32px rgba(0, 0, 0, 0.3)`
- **Transition**: `all 0.3s ease`

### Premium Dashboard Mock
- **Background**: `rgba(15, 15, 18, 0.7)`
- **Backdrop Filter**: `blur(20px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.05)`
- **Border Radius**: `12px`
- **Padding**: `1rem`
- **Shadow**: `0 4px 24px rgba(0, 0, 0, 0.25)`

### Premium Feature Card
- **Background**: `rgba(255, 255, 255, 0.02)`
- **Border**: `1px solid rgba(255, 255, 255, 0.04)`
- **Border Radius**: `10px`
- **Padding**: `1rem`
- **Transition**: `box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease`

### Premium Feature Card Compact
- **Background**: `rgba(255, 255, 255, 0.02)`
- **Border**: `1px solid rgba(255, 255, 255, 0.04)`
- **Border Radius**: `8px`
- **Padding**: `0.75rem`
- **Transition**: `box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease`

## Responsive Breakpoints

- **Mobile**: `max-width: 768px`
- **Tablet**: `min-width: 769px and max-width: 1024px`
- **Desktop**: `min-width: 1025px`

## Animation Delays

- **Delay 100**: `0.1s`
- **Delay 200**: `0.2s`
- **Delay 300**: `0.3s`
- **Delay 400**: `0.4s`
- **Delay 500**: `0.5s`
- **Delay 600**: `0.6s`
