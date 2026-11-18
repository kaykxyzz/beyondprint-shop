/* Beyond Print catalogue: one list used by the shop, the cart, checkout and the header search.
   Prices are indicative placeholders until the client confirms them. "from" = the price per unit at the top quantity tier. */
(() => {
  const APP = { tiers: [[10, 1.3], [25, 1.18], [50, 1.08], [100, 1]], sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    deco: [['Front logo', 0], ['Front + back', 4], ['Front + sleeve', 2]] };
  const HEAD = { tiers: [[10, 1.3], [25, 1.18], [50, 1.08], [100, 1]], deco: [['Front logo', 0], ['Front + side', 3]] };
  const STK = { tiers: [[50, 2], [100, 1.5], [250, 1.2], [500, 1]] };
  const PRT = { tiers: [[1, 1], [2, .95], [5, .9], [10, .85]], unit: 'pack' };
  const PRO = { tiers: [[25, 1.25], [50, 1.12], [100, 1.05], [250, 1]] };
  const SVC = { tiers: [[1, 1]], unit: 'job' };
  const C = (...c) => c;
  const P = [
    ['tee-staple', 'Staple Cotton Tee', 'tee tshirt t-shirt shirt cotton staple', 'Tees & Singlets', 'apparel', 12.9, '../assets/mock-tee.webp', APP, C('#111417', '#ffffff', '#1f3a5f', '#5eafa6', '#6e7174'), 'Everyday 180gsm cotton tee, printed or embroidered with your logo.'],
    ['tee-heavy', 'Oversized Heavyweight Tee', 'tee tshirt oversize heavy', 'Tees & Singlets', 'apparel', 18.9, '../assets/site/apparel--yepp-tee-dtf.webp', APP, C('#111417', '#ffffff', '#c9b79c'), 'Boxy 240gsm streetwear fit for merch drops and crew tees.'],
    ['hoodie', 'Pullover Hoodie', 'hoodie hood jumper fleece sweatshirt', 'Tees & Singlets', 'apparel', 38, '../assets/site/apparel--dtg-neverending-tee.webp', APP, C('#111417', '#6e7174', '#1f3a5f'), 'Mid-weight fleece hoodie with kangaroo pocket.'],
    ['cap-snap', 'Classic Snapback Cap', 'cap hat snapback headwear', 'Headwear', 'apparel', 12.5, '../assets/mock-cap.webp', HEAD, C('#111417', '#6e7174', '#1f3a5f'), 'Structured six-panel snapback with an embroidered front logo.'],
    ['cap-trucker', 'Custom Trucker Cap', 'trucker cap hat mesh custom foam', 'Headwear', 'apparel', 16.5, '../assets/site/apparel--two-nrd-mechanical-trucker-caps.webp', HEAD, C('#111417', '#ffffff', '#f8bec2', '#5eafa6'), 'Mesh-back trucker with a patch or embroidery up front.'],
    ['bucket', 'Bucket Hat', 'bucket hat headwear sun', 'Headwear', 'apparel', 14.9, '../assets/site/apparel--pink-stripe-truckers.webp', HEAD, C('#111417', '#c9b79c', '#5eafa6'), 'Cotton twill bucket hat, embroidered.'],
    ['fishing', 'Custom Sublimated Fishing Shirt', 'fishing shirt sublimated sublimation long sleeve custom', 'Fishing Shirts', 'apparel', 39, '../assets/mock-fishing.webp', { ...APP, deco: [['Full custom design', 0]] }, C('linear-gradient(135deg,#5eafa6,#f8bec2)', '#5eafa6', '#a3dbd3'), 'UPF 50+ long sleeve, printed edge to edge with your full design.'],
    ['polo-sub', 'Sublimated Polo', 'polo sublimated custom sport', 'Fishing Shirts', 'apparel', 36, '../assets/site/apparel--banner-of-fishing-shirts.webp', { ...APP, deco: [['Full custom design', 0]] }, C('#5eafa6', '#1f3a5f', '#111417'), 'Breathable sports polo printed all over in your club colours.'],
    ['polo-pique', 'Pique Polo', 'polo uniform corporate embroidered pique', 'Polos & Uniforms', 'apparel', 24.5, '../assets/mock-polo.webp', APP, C('#111417', '#ffffff', '#1f3a5f', '#6e7174'), 'Corporate pique polo, embroidered and uniform-ready.'],
    ['hivis', 'Hi-Vis Work Shirt', 'hi vis hivis safety work shirt mine spec workwear', 'Workwear & Mine Spec', 'apparel', 32, '../assets/site/apparel--workshirts.webp', APP, C('#f6c400', '#f26b1d'), 'Day/night hi-vis drill shirt with reflective tape, logo embroidered.'],
    ['shorts', 'Work Shorts', 'shorts workwear cargo work', 'Workwear & Mine Spec', 'apparel', 29, '../assets/site/apparel--uniforms-polos-img-9104.webp', { ...APP, deco: [['Leg logo', 0]] }, C('#111417', '#1f3a5f', '#c9b79c'), 'Heavy cotton drill cargo shorts with a leg logo.'],
    ['sticker-die', 'Die-Cut Vinyl Stickers', 'sticker stickers die cut vinyl decal contour', 'Stickers & Labels', 'stickers', .4, '../assets/mock-stickers.webp', STK, null, 'Weatherproof vinyl cut to the shape of your design. Price per sticker.'],
    ['labels', 'Product Labels (roll)', 'label labels roll product packaging', 'Stickers & Labels', 'stickers', .35, '../assets/site/print-stickers-and-labels--stack-of-product-labels.webp', STK, null, 'Labels on a roll for jars, bottles and packaging. Price per label.'],
    ['boat', 'Boat Name & Rego Decals', 'boat name rego decal marine sticker', 'Stickers & Labels', 'stickers', 45, '../assets/site/print-stickers-and-labels--boat-decal-nauti-adventures.webp', { tiers: [[1, 1], [2, .9]], unit: 'set' }, null, 'Marine-grade cut vinyl, supplied ready to apply. Price per set.'],
    ['safety', 'Safety & Machinery Labels', 'safety label machinery instruction mining compliance sticker', 'Stickers & Labels', 'stickers', 6.5, '../assets/site/print-stickers-and-labels--hard-hats-with-cut-vinyl-stickers.webp', { tiers: [[10, 1.4], [25, 1.2], [50, 1.1], [100, 1]] }, null, 'Laminated compliance and instruction labels.'],
    ['cards', 'Business Cards ×250', 'business card cards print premium stock', 'Business Print', 'print', 89, '../assets/mock-print.webp', PRT, null, '400gsm premium stock, printed both sides. Price per pack of 250.'],
    ['flyers', 'Flyers & Brochures', 'flyer flyers brochure dl a5 tri fold leaflet print', 'Business Print', 'print', 110, '../assets/site/print--stack-of-brochures.webp', PRT, null, 'A5, DL or tri-fold on gloss or matt. Price per 500.'],
    ['dockets', 'Docket Books', 'docket book invoice carbonless ncr', 'Business Print', 'print', 145, '../assets/site/print--top-spa-nails-dl-pricing-lists.webp', PRT, null, 'Carbonless duplicate books, numbered. Price per 5 books.'],
    ['booklets', 'Booklets & Catalogues', 'booklet catalogue saddle stitch print', 'Business Print', 'print', 180, '../assets/site/print--tri-fold-brochure-mockup-with-beyond-print-branding.webp', PRT, null, 'Saddle-stitched booklets. Price per 50.'],
    ['pullup', 'Pull-Up Banner', 'pull up banner pullup display event portable', 'Flags & Banners', 'promo', 180, '../assets/site/home--flags-event-banners.webp', { tiers: [[1, 1], [3, .93], [5, .88]] }, null, 'Portable 850mm stand with carry bag, printed graphic included.'],
    ['flag', 'Feather Flag', 'flag flags feather teardrop event banner', 'Flags & Banners', 'promo', 160, '../assets/site/home--flags-event-banners.webp', { tiers: [[1, 1], [3, .93], [5, .88]] }, null, 'Single-sided feather flag with pole and ground spike.'],
    ['cooler', 'Neoprene Can Cooler', 'can cooler stubby holder koozie neoprene drink', 'Drinkware & Coolers', 'promo', 4.9, '../assets/mock-cooler.webp', PRO, C('#111417', '#5eafa6', '#f8bec2', '#ffffff'), 'Full-colour printed stubby cooler with a stitched base.'],
    ['bottle', 'Insulated Drink Bottle', 'bottle drink water insulated stainless flask', 'Drinkware & Coolers', 'promo', 14.5, '../assets/site/home--merch-promo-product-spread.webp', PRO, C('#111417', '#ffffff', '#5eafa6'), 'Double-wall stainless bottle, engraved or printed.'],
    ['tumbler', 'Reusable Coffee Tumbler', 'tumbler coffee cup reusable travel mug', 'Drinkware & Coolers', 'promo', 12.9, '../assets/site/promo--three-custom-tumblers.webp', PRO, C('#5eafa6', '#f8bec2', '#c6e86b'), 'Leak-proof travel tumbler printed with your logo.'],
    ['pens', 'Custom Pens', 'pen pens writing stylus promotional', 'Promo & Merchandise', 'promo', 1.1, '../assets/site/home--merch-promo-product-spread.webp', { tiers: [[100, 1.3], [250, 1.15], [500, 1]] }, C('#111417', '#1f3a5f', '#5eafa6'), 'Click pens printed with your logo.'],
    ['keyrings', 'Keyrings & Magnets', 'keyring keychain magnet fridge promo', 'Promo & Merchandise', 'promo', 2.2, '../assets/site/home--merch-promo-product-spread.webp', PRO, null, 'Printed keyrings or fridge magnets.'],
    ['tote', 'Canvas Tote Bag', 'tote bag canvas shopping calico', 'Promo & Merchandise', 'promo', 6.9, '../assets/site/home--merch-promo-product-spread.webp', PRO, C('#e9e2d4', '#111417'), 'Heavy canvas tote, screen printed.'],
    ['towel', 'Sand-Free Beach Towel', 'towel beach microfibre sand free', 'Promo & Merchandise', 'promo', 22, '../assets/site/home--merch-promo-product-spread.webp', { tiers: [[10, 1.25], [25, 1.1], [50, 1]] }, null, 'Microfibre towel printed edge to edge.'],
    ['logo', 'Logo & Brand Identity', 'logo design brand identity branding artwork', 'Design & Branding', 'design', 355, '../assets/site/print-design-and-branding-ser--design-concepts.webp', SVC, null, 'Three logo concepts, two rounds of changes, all final files.'],
    ['artwork', 'Artwork Setup', 'artwork setup file prep design vector redraw', 'Design & Branding', 'design', 85, '../assets/site/print-design-and-branding-ser--artwork-image.webp', SVC, null, 'We rebuild a low-res logo as clean print-ready vector art.']
  ];
  /* pages in folders use ../assets/; the homepage (site root, marked with <meta name="bp-root">) uses assets/ */
  const atRoot = !!document.querySelector('meta[name="bp-root"]');
  const asset = s => atRoot ? s.replace('../assets/', 'assets/') : s;
  const link = s => atRoot ? s.replace(/^\.\.\//, '') : s;
  const products = P.map(([id, n, k, c, group, p, img, rule, colours, d]) => ({
    id, n, k, c, group, p, img: asset(img), d, colours, tiers: rule.tiers, unit: rule.unit || 'unit',
    sizes: group === 'apparel' && rule.sizes ? rule.sizes : null, deco: rule.deco || null, min: rule.tiers[0][0]
  }));
  const groups = [['all', 'All'], ['apparel', 'Apparel'], ['stickers', 'Stickers & labels'], ['print', 'Print'], ['promo', 'Promo'], ['design', 'Design']];
  const money = v => '$' + (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '');
  const tierOf = (pr, q) => { let t = pr.tiers[0]; for (const x of pr.tiers) if (q >= x[0]) t = x; return t; };
  const unit = (pr, q, decoAdd = 0) => pr.p * tierOf(pr, q)[1] + decoAdd;
  window.BP_CAT = { products, groups, money, tierOf, unit, asset, link, byId: id => products.find(p => p.id === id),
    cats: [...new Set(products.map(p => p.c))].map(c => ({ n: c, group: products.find(p => p.c === c).group })) };
})();
