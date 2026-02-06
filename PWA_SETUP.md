# PWA Setup Instructions

## Icons Required

You need to create PWA icons for the app. Create these files in the `/public` directory:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

### Quick Icon Generation

You can use online tools to generate these icons:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

Or create them manually:
- Use any image editor (Photoshop, Figma, Canva)
- Create a square icon with your app logo/brand
- Export as PNG at 192x192 and 512x512 sizes
- Place both files in the `/public` directory

### Icon Design Tips

- Use a simple, recognizable design
- Ensure it looks good at small sizes
- Consider using your brand colors
- Make sure it's readable on both light and dark backgrounds
- For maskable icons, keep important content within the safe zone (80% of the icon)

## Testing PWA Features

### On Desktop (Chrome/Edge)

1. Open DevTools (F12)
2. Go to Application tab
3. Check "Manifest" section
4. Check "Service Workers" section
5. Use "Add to Home Screen" option

### On Mobile (iOS Safari)

1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. The app will launch in standalone mode

### On Mobile (Android Chrome)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. The app will install as a PWA

## Features Implemented

✅ **Manifest.json** - PWA manifest file
✅ **Service Worker** - Basic offline caching
✅ **Mobile Viewport** - Proper viewport settings with safe area support
✅ **Standalone Display** - Full screen app experience
✅ **Touch-Friendly** - Minimum 44px touch targets
✅ **Safe Area Insets** - Support for iPhone notches
✅ **No Zoom on Input** - Prevents iOS zoom on input focus
✅ **Responsive Design** - Mobile-first responsive layout

## Deployment Checklist

- [ ] Create icon-192.png and icon-512.png
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on desktop browsers
- [ ] Verify service worker registration
- [ ] Test offline functionality
- [ ] Verify safe area insets on notched devices

## Environment Variables for Vercel

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- The service worker uses a basic caching strategy
- For production, consider implementing more sophisticated caching strategies
- Icons should be optimized for file size
- Test on actual devices, not just emulators

