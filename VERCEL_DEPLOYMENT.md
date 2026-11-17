# Vercel deployment preparation

The local front-end is configured for Vercel with `vercel.json`. No Vercel project has been created or deployed in this step.

When importing Shayan1095/mablle-interior into Vercel, leave Root Directory as `.` (the repository root contains package.json and vercel.json). Locally, this is the mablle-interiors folder. Framework: Vite. Install: npm's detected lockfile workflow. Build: `npm run build`. Output: `dist`. No environment variables or backend are required for this demo.

The site uses `/#section` and `/?piece=product-id` navigation; there are no nested client-side routes requiring a catch-all rewrite. Fingerprinted JS/CSS in `/assets/` can be cached immutably. The small `/boot.js` file revalidates on requests. Unversioned photographs use Vercel's default caching instead of a year-long immutable policy.

Before deployment, run:

```sh
npm test
npm run check:markup
npm run build
npm run check:performance
```

The first-visit preloader is controlled by the `mablle-intro-seen` sessionStorage key. To review it again, use a fresh browser session or clear that key. There is no mandatory minimum duration: on a quick connection it can be brief. It waits at most 700 ms for the hero after React mounts, bounded by a 2.5-second startup deadline plus a 180 ms exit. Fonts never gate dismissal. Loading failures expose a reload link, and reduced motion disables the pulse/fade and entrance motion.

Hero and scroll entrances wait for the loader to finish. Scroll entrances begin inside the viewport, rather than running before visitors reach them. Before final client approval, review the deployed preview on desktop and mobile, including first/repeat loads, reduced motion, catalog filters, product dialogs and the Guide. Local browser visual verification remains blocked by the saved preview permission; passing artifact checks does not substitute for that review.

The Guide and forms remain front-end demonstrations. No messages, bookings or payments are sent. This Vercel preparation does not use the earlier unpublished Sites registration.

Reference: [Vercel project configuration](https://vercel.com/docs/project-configuration).

The dedicated browse page is available at `/?view=shop`, including shared queries such as `/?view=shop&q=lounge+chairs&budget=100000`. This also uses the root document, so no additional rewrite is required. Include browse filters, recommendations, empty results and product Back/Forward navigation in the deployed preview review.
