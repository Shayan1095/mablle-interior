# Mablle Interiors

A front-end concept for an interior studio and curated furniture collection. Prices are illustrative PKR values. No orders, payments, messages or appointments are submitted.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local URL. For a production build, run `npm run build`; the static output is in `dist/`. `npm run preview` serves that output locally.

## Motion, with a purpose

- **Lenis** smooths desktop wheel scrolling with a short 0.45-second settling time and its own animation loop. Touch scrolling remains native. Reduced-motion preferences disable smoothing.
- **GSAP** handles the short hero entrance. `@gsap/react` scopes cleanup. Section entrances use one-time IntersectionObservers and native transform/opacity animation; content remains visible before animations initialize. ScrollTrigger is no longer loaded.
- **Motion for React** handles menu, product, service and dialog transitions. It is the Framer Motion successor used here; a duplicate Framer Motion installation is unnecessary.
- **Lucide React** provides functional interface icons.

No particle/WebGL library or React Bits dependency was added because those effects do not serve product discovery or the studio's calm visual direction.

The refined motion includes a 0.7-second hero sequence after the preloader clears with immediately visible actions, 0.28/0.18-second product-image transitions into/out of native dialogs, transform-only project-photo entrances, stable service panels, saved-heart/price/filter feedback, current-section navigation and staggered mobile links. Product transitions fall back to fades for reduced motion, offscreen origins and interrupted layout changes. Header positions are remeasured on layout changes, not every scroll frame.

Photographs use locally generated responsive JPEG variants and asynchronous decoding. The hero preload matches its srcset. Fonts use a single nonblocking stylesheet; no CSS import waterfall. Run `./scripts/optimize-images.ps1` after replacing original photos to rebuild `src/image-manifest.json` and `public/images/optimized/`. Originals are retained. Dialog code warms on pointer/focus intent.

## Mablle Guide

The integrated Guide section is a deterministic front-end assistant using `guide-engine.js`, `catalog.js` and `service-data.js`. It supports guided product/category/budget discovery, simple free-text catalog questions, service scope/fee questions and honest demo FAQs. It can open product details, apply matching collection filters and prepare a contextual demo inquiry.

Try “chairs under 100k”, then “under 80k”; “Sora dimensions”; “What does room styling include?”; and “Can you deliver tomorrow?”. Budget notation supports PKR amounts, k and lakh/lac. Custom maximum budgets remain exact when opening the collection.

It does not use an external AI model, provide live business information, send messages, book appointments or persist the conversation. No backend or API key has been added.

## Structure

- `src/App.jsx`: shell, hero, shared UI state, favorites and URL state.
- `src/Header.jsx`: section-aware navigation, theme adaptation and mobile menu.
- `src/catalog.js`: product records, PKR formatting, filtering and variant prices.
- `src/Collection.jsx`: search, categories, filters, sorting and product cards.
- `src/Services.jsx`: service selections and scope.
- `src/service-data.js`: service content shared by the page and Guide.
- `src/Guide.jsx` and `src/guide-engine.js`: conversation UI and deterministic catalog/FAQ responses.
- `src/Projects.jsx`: concept spaces and related product suggestions.
- `src/Studio.jsx`: brand point of view and material palette.
- `src/Contact.jsx`: consultation section, FAQs and footer.
- `src/InquiryForm.jsx`: accessible local-only inquiry form.
- `src/Overlay.jsx`: native accessible dialogs for products, favorites, inquiries, projects and demo information.
- `src/motion.js`: motion lifecycle, reduced-motion media handling and scrolling.
- `src/useProductFlight.js` and `src/product-transition.js`: measured native-dialog image transitions and geometry fallbacks.
- `src/styles.css`: responsive visual system and section styles.
- `public/images/SOURCES.json`: source image references.

## Content updates

Replace sample products in `catalog.js` and their matching images in `public/images/`. Product IDs are used in saved items and links, so retain IDs when updating the same item. A detail link uses `?piece=sora-sofa`; collection filters use query parameters and survive browser history navigation.

Set approved service fees and scope in `Services.jsx`. Replace concept project copy and photos in `Projects.jsx` with client-approved work. Confirm permission to use all production images. The photographs currently illustrate the concept and are not evidence of completed Mablle work. The studio narrative is proposed brand copy.

The form currently validates on the client and displays an explicit not-sent state. Connecting a real inquiry endpoint is a separate integration. Do not change the confirmation wording to imply delivery until a real successful submission response is available.

Favorites store only product IDs in localStorage (`mablle-saved`). Personal contact inputs are neither persisted nor sent by this implementation. Google Fonts supplies the typefaces; system fallbacks are included.

## Checks

```sh
npm test
npm run check:markup
npm run build
npm run check:performance
```

Tests cover catalog behavior, Guide conversation branches, PKR budget parsing, no-match/unsupported-answer behavior and transition geometry. The offline React renderer checks generated markup, anchors, unique IDs, asset paths, dialog titles, service control targets, Guide accessibility markup, exact custom-budget selection and inquiry context. It does not launch a browser or test layout or real interaction.

**Verification limit:** browser inspection was blocked by a saved local-origin permission even after the user approved a retry. Desktop/mobile layout, native-dialog interaction, motion timing, keyboard journeys and measured Core Web Vitals remain to be reviewed in a real browser. Do not describe them as visually verified.

## Repository and deployment

Repository: [Shayan1095/mablle-interior](https://github.com/Shayan1095/mablle-interior). The repository root contains package.json and vercel.json; use `.` as the Root Directory when importing into Vercel. Local hosting metadata, environment files, dependencies and generated build output are excluded from Git. No Vercel deployment has been performed.

## Branded loading and Vercel preparation

The first visit in a tab session shows a lightweight ivory Mablle preloader. It dismisses as soon as the app/hero is ready, with a 180 ms exit and no forced minimum wait. A bounded image wait and startup recovery prevent indefinite loading. Reduced motion disables the pulse and fade; future visits in the session skip it. Hero and scroll entrances begin after dismissal. Section/product-photo entrances now trigger inside the viewport (480 ms), with 650 ms editorial image settling so the transitions remain perceptible.

`public/boot.js` has offline lifecycle coverage for cached/slow/failed images, repeated visits, unavailable storage, late startup, missing application code and reduced motion. Browser visual verification remains pending under the saved preview permission.

`vercel.json` prepares the Vite build, output directory and fingerprinted-asset caching. See VERCEL_DEPLOYMENT.md for project-root settings and review steps. No Vercel deployment has been performed.

## Search and browse

Open `/?view=shop` from Collections or the header search icon. The dedicated browse page has a large search field, suggested phrases, category/material/maximum-price filters, removable filter chips, sorting, PKR prices and product recommendations. Product dialogs, saved pieces and demo inquiries work across both pages. Search supports multiword matches, plural furniture names, colors/finishes and common synonyms (for example, “green couch” and “wooden table”). Results update as you type; Search brings the results into view. Mobile filters collapse after Show pieces.

The URL stores the selected filters and product, preserving shareable searches and browser history. Recommendations use the local sample catalog, respect category/material/budget constraints, and are explicitly separated from exact search results. They are editorial suggestions, not inferred customer profiling. No extra dependency or external recommendation service was added.
