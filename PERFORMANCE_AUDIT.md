# Local performance audit — 17 November 2026

The audit covers source behavior, production asset sizes and offline rendered markup. Browser access remains blocked by the saved preview policy, so there are no measured LCP, INP, frame-rate or Lighthouse results. The changes below address identifiable work and intentional animation delays; file-size reductions are not claimed as measured page-speed gains.

## Findings and fixes

| Area | Before | After |
| --- | --- | --- |
| Desktop scroll settling | 950 ms; coupled to GSAP's ticker | 450 ms; Lenis owns its loop, allowing GSAP to sleep when inactive |
| Section entrances | 800 ms; every target hidden ahead of its scroll trigger | 300 ms, triggered slightly before entry; content visible by default |
| Hero | 1,200 ms; actions begin fading in after 450 ms | 550 ms; actions immediately visible |
| Project photography | Large animated clip paths and one-second image motion | 420 ms transform-only image entrance; captions immediately readable |
| Product photo transition | 480 ms opening / 380 ms closing | 280 ms opening / 180 ms closing |
| Detail copy | 160 ms delay + 420 ms entrance | No delay, 180 ms entrance |
| Service selection | 400 ms image transition and implicit spring timing | 220 ms image transition, explicit 180 ms content transitions |
| Header | Geometry reads across all sections on each scroll frame, backdrop blur | Cached positions invalidated by resize/layout changes; solid translucent background |
| Filters | Layout animation on both the grid and each card | Card-position animation only; 200 ms reflow and 180 ms filter-panel timing |
| Fonts | Render-blocking stylesheet plus a CSS-import request for the italic face | One nonblocking font stylesheet with system fallbacks and font-display swap |
| Images | One JPEG size per photograph | 30 local responsive variants, accurate dimensions, async decoding and matching hero preload |
| Dialog loading | Lazy chunk requested on first click | Chunk warmed once on pointer/focus intent; still excluded from initial JS |

ScrollTrigger is no longer shipped. GSAP remains for the hero, Motion for UI transitions, and Lenis for desktop smoothing. Reduced motion still disables entrance animations and scrolling effects. Native touch scrolling, catalog functionality and the local Guide remain intact.

## Artifact measurements

Sizes are decimal kB. The before values come from the preceding verified production build.

| Resource | Before | After |
| --- | ---: | ---: |
| Scroll animation JavaScript, uncompressed | 136.48 kB | 91.95 kB |
| All initial JavaScript, gzip | 183.70 kB | approximately 167.1 kB |
| Hero photograph, largest delivered version | 639.74 kB at 2200 px | 374.71 kB at 1920 px |
| Hero photograph, 1280 px candidate | same 639.74 kB original | 195.68 kB |
| Hero photograph, 640 px candidate | same 639.74 kB original | 63.13 kB |

The browser chooses responsive image candidates using viewport size and device pixel ratio. Original photographs remain untouched. The optimized 1280 px hero was inspected as a local image; this does not constitute page-layout QA.

## Validation and reproduction

Run `npm test`, `npm run check:markup`, `npm run build`, then `npm run check:performance`. The last command enforces initial gzip JS below 175 kB, hero image budgets, responsive-file consistency, no chained CSS imports and a responsive hero preload. The markup check verifies all rendered image candidates exist and retains dialog, navigation and Guide checks.

`npm run preview` serves the production build. Development mode includes Vite/React development overhead and should not be used for final speed measurements. When browser access is available, test a cold production load on desktop and mobile, rapid scrolling, repeated product open/close, service changes, filters, and reduced motion. Confirm image quality and layout shifts after fonts swap.

Lenis options were checked against its installed 1.3.27 source and [official documentation](https://github.com/darkroomengineering/lenis#setup). No new dependency, source upload or publication was required.
