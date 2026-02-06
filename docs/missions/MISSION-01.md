# MISSION 01: Foundation & Core Setup

## Mission Objective

Establish the complete project foundation: Next.js with TypeScript, Tailwind CSS configuration, base layout structure, and static placeholder UI. By the end of this mission, you should have a beautiful, static version of the arena that looks complete even without any functionality.

This mission is the most critical — a solid foundation enables rapid iteration. Rushing here causes compounding problems later.

---

## Time Estimate

**45-60 minutes**

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or pnpm available
- A code editor (VS Code/Cursor recommended)
- The Odyssey API key ready (you'll add it in Mission 2)

---

## Detailed Instructions

### Phase 1: Project Creation

The first step is creating a fresh Next.js project with all the right configurations. We use the App Router (not Pages Router) for modern React patterns and better performance.

Create the project in your hackathon directory. The project should be named `odyssey-arena` and configured with TypeScript, Tailwind, ESLint, and the App Router. Do not use the `src/` directory option — keep components in the app folder for simplicity.

After creating the project, navigate into it and install additional dependencies for animations. Framer Motion is our animation library, and we'll also add some helpful utilities.

**What to verify:**
- `package.json` exists with correct dependencies
- `tailwind.config.ts` exists (not .js)
- `tsconfig.json` has strict mode enabled
- `app/` folder contains `layout.tsx` and `page.tsx`

---

### Phase 2: Tailwind Configuration

Configure Tailwind with our custom design system. This includes the color palette, custom shadows, and animation utilities. The theme extension is crucial for achieving the liquid glass aesthetic.

The configuration should extend the default Tailwind theme with:
- Custom box shadows (`glass`, `glass-lg`, `glass-glow`, `phone`)
- Custom colors if needed (though we'll mostly use Tailwind's built-in sky and pink)
- Font family set to system fonts for performance
- Ensure the content paths include all component locations

**What to verify:**
- Running `npm run dev` shows no Tailwind errors
- Custom shadow utilities work (test with `shadow-glass`)

---

### Phase 3: Global Styles

Set up the global CSS file with animation keyframes and utility classes. These CSS animations supplement Framer Motion for simple, always-running animations like floating and pulsing.

The globals.css should include:
- CSS reset/normalization (Tailwind handles most of this)
- Custom keyframe animations (float, pulse-soft, glow-pulse, shake)
- Utility classes for these animations
- Custom scrollbar styling for the event log
- Any additional glass/gradient utilities

**What to verify:**
- `.animate-float` class causes vertical movement
- `.animate-pulse-soft` causes opacity pulsing
- No CSS errors in browser console

---

### Phase 4: Arena Container Component

Create the main Arena component that serves as the page container. This component establishes the gradient background and overall layout structure. It should occupy the full viewport with the soft sky-blue to cotton-candy-pink gradient.

The Arena should:
- Fill the entire viewport (`min-h-screen`)
- Display the gradient background
- Center its children both horizontally and vertically
- Have adequate padding and space for the fixed prompt bar at bottom
- Use flexbox for layout

**What to verify:**
- Background gradient is visible and smooth
- Content is centered on the page
- No horizontal scrollbar appears

---

### Phase 5: Phone Screen Component (Static)

Create the PhoneScreen component that displays a phone-styled frame. For now, use a static placeholder image or colored background instead of actual video. The phone should look like a premium smartphone with rounded corners and a subtle frame.

The PhoneScreen should include:
- Outer frame (dark, rounded corners like iPhone)
- Inner screen area (black background, rounded corners)
- Placeholder content (gradient or placeholder image)
- Overlay area at bottom for character info (gradient from transparent to dark)
- Text placeholders for character name, world, and stats

Create two instances: one for Player 1 (slight left rotation) and one for Player 2 (slight right rotation).

**What to verify:**
- Phone frames look realistic and premium
- Slight rotations make the layout feel dynamic
- Text is readable over the overlay gradient

---

### Phase 6: Center HUD Component (Static)

Create the CenterHUD component that displays between the two phones. This shows the VS badge, momentum bars, and event log. Use the glassmorphism styling (white/10 background, backdrop-blur, subtle border).

The CenterHUD should include:
- Glass panel container with blur effect
- VS badge (styled text or simple graphic)
- Two momentum bar placeholders (horizontal colored bars)
- Event log area with sample placeholder events
- Proper spacing between elements

**What to verify:**
- Glassmorphism effect is visible (content behind is blurred)
- VS badge is prominent and eye-catching
- Momentum bars are clearly visible

---

### Phase 7: Prompt Bar Component (Static)

Create the PromptBar component fixed to the bottom of the viewport. This is where players will type their actions. Include the player selector buttons on each side and a text input in the center.

The PromptBar should include:
- Fixed positioning at bottom of viewport
- Glass panel styling
- Left arrow/button for Player 1
- Center text input (styled but not functional yet)
- Right arrow/button for Player 2
- Submit button (optional, can use Enter key)

**What to verify:**
- Bar is fixed and doesn't scroll with page
- Input is visually prominent
- Player selectors are clickable-looking

---

### Phase 8: Assemble the Page

Combine all components in the main page.tsx. The layout should match the design spec: phones on left and right, HUD in center, prompt bar at bottom.

The page structure should be:
1. Arena container (full page)
2. Battle area (flex row with three columns)
   - Phone 1 (left)
   - Center HUD (middle)
   - Phone 2 (right)
3. Prompt bar (fixed bottom, separate from flex)

**What to verify:**
- All three main elements are visible
- Layout is balanced and centered
- Prompt bar doesn't overlap other content
- Page looks good at 1920x1080 resolution

---

### Phase 9: Responsive Considerations

Add basic responsive adjustments for different screen sizes. The primary target is desktop (1920x1080 and 1440x900), but the layout should degrade gracefully.

Consider:
- Smaller phone sizes on tablets
- Possibly stacking elements on mobile (optional — demo will be on desktop)
- Minimum width constraints to prevent breaking

**What to verify:**
- No layout breaks at 1024px width
- Elements scale proportionally

---

### Phase 10: Final Polish

Review the entire static layout and make visual refinements:
- Adjust spacing for visual balance
- Ensure colors are consistent
- Check shadow depths
- Verify all glassmorphism effects render correctly
- Test in multiple browsers if possible

**What to verify:**
- Overall aesthetic matches the design vision
- No visual bugs or glitches
- The demo looks impressive even without functionality

---

## Deliverables Checklist

At the end of Mission 01, you should have:

### Project Structure
- [ ] Next.js project created with App Router
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS configured with custom theme
- [ ] Global CSS with animation keyframes
- [ ] Framer Motion installed

### Components Created
- [ ] `app/page.tsx` - Main page
- [ ] `app/layout.tsx` - Root layout
- [ ] `app/globals.css` - Global styles
- [ ] `components/Arena.tsx` - Container with gradient
- [ ] `components/PhoneScreen.tsx` - Phone frame with placeholder
- [ ] `components/CenterHUD.tsx` - Glass panel with VS/bars/log
- [ ] `components/PromptBar.tsx` - Input bar fixed to bottom

### Visual Verification
- [ ] Gradient background displays correctly
- [ ] Phone frames look like actual phones
- [ ] Glassmorphism effect works on HUD
- [ ] All text is readable
- [ ] Layout is centered and balanced
- [ ] No TypeScript errors
- [ ] No console errors

---

## Cursor Coding Model Instructions

**ATTENTION CURSOR:** When executing this mission, follow these steps precisely:

1. **Review all documentation first:**
   - Read `docs/00-MASTER-PLAN.md` for overall context
   - Read `docs/design/01-visual-style.md` for colors and styling
   - Read `docs/design/02-layout.md` for component positioning
   - Read `docs/design/03-components.md` for component specs

2. **Create the Next.js project:**
   ```bash
   npx create-next-app@latest odyssey-arena --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
   cd odyssey-arena
   npm install framer-motion
   ```

3. **Configure Tailwind** in `tailwind.config.ts`:
   - Add custom boxShadow values (glass, glass-lg, glass-glow, phone)
   - Add custom colors if needed
   - Configure content paths

4. **Set up global styles** in `app/globals.css`:
   - Add animation keyframes (float, pulse-soft, glow-pulse, shake)
   - Add utility classes
   - Add scrollbar styling

5. **Create components in order:**
   - Arena.tsx (container with gradient)
   - PhoneScreen.tsx (phone frame with placeholder)
   - CenterHUD.tsx (glass panel with static content)
   - PromptBar.tsx (fixed input bar)

6. **Assemble in page.tsx:**
   - Import all components
   - Structure the layout correctly

7. **Verify and fix:**
   - Run `npm run dev`
   - Check for TypeScript errors
   - Check for lint errors with `npm run lint`
   - Visually verify the layout

8. **Do NOT proceed to Mission 02** until all checklist items are complete.

---

## Troubleshooting

### Common Issues

**Gradient not showing:**
- Ensure the container has `min-h-screen`
- Check that Tailwind classes are correct (`from-`, `via-`, `to-`)

**Glassmorphism not working:**
- Verify `backdrop-blur-xl` is applied
- Ensure there's content behind the glass panel
- Check browser supports backdrop-filter

**Phone frames look wrong:**
- Use `rounded-[44px]` for outer frame (large radius)
- Use `rounded-[36px]` for inner screen
- Add proper padding between frame and screen

**Prompt bar overlapping content:**
- Add `pb-32` or similar padding to main content
- Ensure prompt bar uses `fixed bottom-0`

---

## Success Criteria

This mission is complete when:
1. Running `npm run dev` shows a beautiful static arena
2. No TypeScript or lint errors
3. Layout matches the design spec
4. All placeholder content is visible
5. The page would impress someone even without functionality
