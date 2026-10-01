# Armoze styling source

Reference repository: https://github.com/Armond-Guze/no-rewind-art
Local source: C:/Users/Armon/projects/no-rewind-art

- `public/storefront-navigation.css` is copied unchanged from `src/next/storefront/storefront-navigation.css`.
- `public/footer-reveal.css` is copied unchanged from `src/next/storefront/footer-reveal.css`.
- `public/armoze-match.css` uses the desktop footer rules from `src/styles.css`, with HVAC class names and content. Mobile benefit typography, dots, and footer accordion rules come from the same source.
- `public/fonts.css` uses the same Poppins weights, Inter files, and fallback metrics as `app/layout.jsx` and its generated font CSS. The local font files are exact copies; licenses are included in `public/fonts`.
- `public/site.js` ports FooterReveal, FooterBenefits, MobileNavigationSheet, LaunchPromoBar, and useStorefrontTopChromeState from `src/next/storefront/StorefrontChrome.tsx` to the static HVAC site. Timing and easing match the source. Announcement rotation pauses during hover/focus. Footer focus reveal applies to keyboard focus to keep pointer clicks stable.

The HVAC content, request handler, custom domain, small business graphic, and omitted footer contact details stay specific to this site.
