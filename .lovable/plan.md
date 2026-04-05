

## Plan: Replace Shield Icon with Custom Structura Logo

The uploaded image is your custom Structura logo. Here's how to add it:

### Steps

1. **Copy the image** to `src/assets/icons/structura-logo.png`

2. **Update `HomeView.tsx`** — Replace the Shield icon import with an `<img>` tag using the custom logo:
   - Remove `Shield` from lucide imports
   - Add `import structuraLogo from "@/assets/icons/structura-logo.png"`
   - Replace the `<Shield>` element with `<img src={structuraLogo} alt="Structura" className="w-6 h-6" />`

3. **Optionally update other locations** — The same logo can replace Shield icons in `BottomNav.tsx`, `DesignView.tsx`, or anywhere else you'd like branding consistency.

### Technical Details
- Image stored in `src/assets/icons/` for Vite bundling and optimization
- Imported as ES6 module for type safety
- The existing gradient container (`gradient-accent shadow-glow`) stays — the logo sits inside it

