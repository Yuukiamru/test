# Lorem — Revised Frontend

## Files
- `index.html` — page structure and accessible dialogs.
- `style.css` — original visual system plus responsive, accessibility, fallback, cart, and history refinements.
- `script.js` — product selection/search/sorting, bouquet builder, cart, checkout simulation, local order history, and WhatsApp handoff.
- `assets/` — put the original project's image assets here (they were not part of the three uploaded source files).

## Run locally
1. Keep `index.html`, `style.css`, and `script.js` in the same folder.
2. Copy the original `assets/` folder into this folder.
3. Open the folder in VS Code and run `index.html` with Live Server.

## Demo behavior / limits
- Cart and order history use this browser's `localStorage`; they do not sync between devices.
- Checkout creates a local demo order. Bank transfer, QRIS, COD, payment verification, inventory, and courier tracking are not connected to live services.
- Shipping fees are selected manually by zone; they are not calculated from the address.
- Order status can be advanced manually for presentation only.
- The WhatsApp button opens a prefilled message. The customer must review and send it.
- Before presenting, confirm `WHATSAPP_NUMBER` near the top of `script.js` is the store's intended number. It retains the number from the original project source.

## Changes applied
- Fixed invalid CSS keyframe identifiers.
- Added Shop search and sorting without changing the left-list/right-preview layout.
- Added clearer product metadata and image fallbacks.
- Added real flower asset previews in the bouquet builder, with glyph fallbacks.
- Added bouquet price breakdown and retained the 12-stem limit.
- Added cart clear action, quantity ceiling, and more explicit shipping/demo wording.
- Normalized Indonesian WhatsApp numbers to `62...` at checkout.
- Added browser-local order history.
- Improved responsive Shop layout, visible scrollbar, focus states, and dialog layering.

## Validation
JavaScript syntax (`node --check`), HTML ID/structure checks, and CSS parsing were run. A full interactive browser test could not be completed in this execution environment, so run the Shop → Builder → Cart → Checkout → Order History flow in your browser before the class demo.


## Live Preview update

The Bouquet Builder now places each complete flower SVG as a single asset. The SVG's own stem is preserved; the former separately generated CSS stems have been removed from the HTML and JavaScript. Flower positions are arranged using count-specific bouquet layouts, with a shared stem-base area near the wrapping. Keep the original `assets/flowers/` directory alongside `index.html` so `lilly.svg`, `tulip.svg`, and `purple.svg` resolve correctly.


## Additional Bouquet Builder assets
The 17 user-supplied transparent flower images are stored in `assets/flowers/`:
- 4 Hydrangeas
- 4 Gerberas
- 4 Carnations
- 5 new Fillers (Baby's Breath, Chamomile, Million Stars, Statice, Wax Flower)

Each preview image is rendered as one complete object (flower head, leaves and original stem). No separate CSS stem is generated for these new assets.

**Important:** prices for the 17 added options are provisional values in `script.js`; update them before presenting the catalog as final.


## Live Preview layout update
- Flower choices are in a fixed-height scrollable panel; the wrapping selector remains visible below the list.
- Complete flower PNGs rotate around a shared bottom-center pivot. This fans the flower heads outward while bringing the original stems together near the center, matching the supplied Figma composition reference.
- The flower list is keyboard-scrollable and has an accessible region label.


## Free Arrangement (Live Preview)
- Click a flower image in the preview to select it.
- Drag horizontally to rotate the complete flower asset around its lower stem end.
- Use the rotate and size controls for fine adjustments.
- Auto arrange restores a balanced fan composition.
- The pivot stays at the bottom-center so original stems continue to converge.
- The reset bouquet button clears all selected flowers and wrapping.

## Asset note
This package includes the 17 additional PNG flower assets. The original six flower SVGs and the site's logo/chair/icon assets were not present in the latest project archive I could access. Copy the original `assets/flowers/lilly.svg`, `tulip.svg`, `purple.svg`, `logo.svg`, `chair.svg`, and `assets/icon.svg` into the matching paths from your source project so the original site imagery remains intact.
