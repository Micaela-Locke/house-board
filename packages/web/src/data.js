/* ============================================================
   Seed data — the rooms and their starter boards.
   Photos are auto-loaded from src/uploads/{roomId}/ via uploads.js;
   everything else (paint, stickies, lists, timelines, links) lives
   here as opinionated starter content.
============================================================ */

const ROOMS = [
  {
    id: 'captain-nook',
    num: '01',
    name: "Captain's Nook",
    location: '3rd Floor',
    sheet: 'A-101',
    subtitle: 'Reading corner + built-ins',
    scope: 'diy',
  },
  {
    id: 'powder-room',
    num: '02',
    name: 'Powder Room',
    location: 'Ground Floor',
    sheet: 'A-102',
    subtitle: 'Powder room refresh',
    scope: 'diy',
  },
  {
    id: 'zuzu-bath',
    num: '03',
    name: "Zuzu's Bath",
    location: '2nd Floor',
    sheet: 'A-103',
    subtitle: 'Clawfoot + beadboard',
    scope: 'diy',
  },
  {
    id: 'laundry',
    num: '04',
    name: 'Laundry Room',
    location: 'Ground Floor',
    sheet: 'A-104',
    subtitle: 'Utility, prettier',
    scope: 'mixed',
    pro: 'Cabinetry contractor — TBD',
  },
  {
    id: 'library',
    num: '05',
    name: 'Library',
    location: 'Ground Floor',
    sheet: 'A-105',
    subtitle: 'Family room w/ books',
    scope: 'diy',
  },
  {
    id: 'coffee-wet-bar',
    num: '06',
    name: 'Coffee + Wet Bar',
    location: 'Ground Floor',
    sheet: 'A-106',
    subtitle: 'Morning coffee, evening cocktails',
    scope: 'pro',
    pro: 'deVOL Kitchens — design + build',
  },
  {
    id: 'gym',
    num: '07',
    name: 'Home Gym',
    location: 'Basement',
    sheet: 'A-107',
    subtitle: 'Strength + cardio',
    scope: 'diy',
  },
];

/* Starter boards — one per room. `photos: []` is deliberate; photos are
   merged in from src/uploads/{roomId}/ at runtime. */
const STARTER_BOARDS = {
  'zuzu-bath': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 680, y: 620, color: 'yellow', rot: -3.5,
        text: "Tub paint: Farrow & Ball 'Setting Plaster'?\nTalk to plumber re: floor-mount supply.",
        author: 'M',
      },
      {
        id: 's2', x: 1060, y: 640, color: 'blue', rot: 2.5,
        text: "LOVE the wainscot height ~ 4' — lets art gallery above breathe.",
        author: 'W',
      },
    ],
    tags: [
      { id: 't1', x: 1380, y: 300, color: 'blue', label: 'beadboard wainscot' },
      { id: 't2', x: 1380, y: 340, color: 'red', label: 'clawfoot tub' },
      { id: 't3', x: 1380, y: 380, color: 'green', label: 'Shrigley zodiac print' },
      { id: 't4', x: 1380, y: 420, color: 'yellow', label: 'patterned floor' },
      { id: 't5', x: 1380, y: 460, color: 'red', label: 'brass fixtures' },
    ],
    list: {
      id: 'l1', x: 1380, y: 540,
      title: 'To-do',
      sub: 'punch list',
      items: [
        { text: 'measure room + door swing', done: true },
        { text: 'sample paint chips (4)', done: true },
        { text: 'order beadboard paneling', done: false },
        { text: 'source clawfoot — reclaimed?', done: false },
        { text: 'tile estimate', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 280, y: 760,
      title: 'Phase plan',
      phases: [
        { label: 'Demo + paint', meta: 'Apr — 2 wkds', status: 'done' },
        { label: 'Beadboard install', meta: 'May', status: 'active' },
        { label: 'Tile floor', meta: 'Jun — contractor', status: 'todo' },
        { label: 'Plumbing + tub set', meta: 'Jul', status: 'todo' },
        { label: 'Styling + art hang', meta: 'Aug', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 820,
      title: 'Sourcing',
      items: [
        { name: 'Setting Plaster eggshell', vendor: 'Farrow & Ball', price: '$120/gal', url: '#' },
        { name: 'Winchester beadboard', vendor: 'Home Depot', price: '$38/panel', url: '#' },
        { name: 'Windsor Clawfoot 66"', vendor: 'Signature Hardware', price: '$2,450', url: '#' },
        { name: 'Trellis blue encaustic 8×8', vendor: 'Granada Tile', price: '$18/sqft', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1100, y: 820,
      title: 'Paint palette',
      chips: [
        { name: "Cook's Blue", vendor: 'Farrow & Ball', hex: '#4A6F8A', use: 'wainscoting', code: 'No. 237' },
        { name: 'Setting Plaster', vendor: 'Farrow & Ball', hex: '#E8CFC1', use: 'walls', code: 'No. 231' },
        { name: 'Pointing', vendor: 'Farrow & Ball', hex: '#EFE8DB', use: 'trim / ceiling', code: 'No. 2003' },
      ],
    },
  },

  'powder-room': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 640, y: 660, color: 'pink', rot: -2.5,
        text: "Powder room = go BOLD.\nWallpaper ceiling + all.",
        author: 'W',
      },
      {
        id: 's2', x: 920, y: 640, color: 'yellow', rot: 3,
        text: 'Tiny room — 1 big idea.\nMirror + light fixture = jewelry.',
        author: 'M',
      },
    ],
    tags: [
      { id: 't1', x: 1320, y: 300, color: 'red', label: 'patterned wallpaper' },
      { id: 't2', x: 1320, y: 340, color: 'blue', label: 'skirted vanity' },
      { id: 't3', x: 1320, y: 380, color: 'green', label: 'brass sconce' },
      { id: 't4', x: 1320, y: 420, color: 'yellow', label: 'scalloped edges' },
    ],
    list: {
      id: 'l1', x: 1320, y: 500,
      title: 'To-do',
      sub: 'punch list',
      items: [
        { text: 'measure + photograph existing', done: false },
        { text: 'wallpaper samples (3)', done: false },
        { text: 'find skirted sink fabric', done: false },
        { text: 'replace toilet?', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 260, y: 780,
      title: 'Phase plan',
      phases: [
        { label: 'Demo wallpaper + prime', meta: 'Sep — 1 wkd', status: 'todo' },
        { label: 'Hang new paper', meta: 'Sep', status: 'todo' },
        { label: 'Skirted sink DIY', meta: 'Oct — sewing', status: 'todo' },
        { label: 'Lighting + styling', meta: 'Oct', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 820,
      title: 'Sourcing',
      items: [
        { name: 'Dogwood wallpaper', vendor: 'Sister Parish', price: '$310/roll', url: '#' },
        { name: 'Scalloped mirror 24"', vendor: 'Anthropologie', price: '$348', url: '#' },
        { name: 'Gingham yardage', vendor: 'Rogers & Goffigon', price: '$54/yd', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1080, y: 820,
      title: 'Paint palette',
      chips: [
        { name: 'Eating Room Red', vendor: 'Farrow & Ball', hex: '#8B3B36', use: 'walls (bold)', code: 'No. 43' },
        { name: 'Pointing', vendor: 'Farrow & Ball', hex: '#EFE8DB', use: 'trim', code: 'No. 2003' },
      ],
    },
  },

  'captain-nook': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 660, y: 660, color: 'blue', rot: -3,
        text: "Built-ins painted same as walls —\n'tonal' Plain English trick.",
        author: 'M',
      },
      {
        id: 's2', x: 980, y: 640, color: 'green', rot: 2.2,
        text: 'Reading light essential.\nWired sconce vs. plug-in?',
        author: 'W',
      },
    ],
    tags: [
      { id: 't1', x: 1380, y: 300, color: 'blue', label: 'tonal built-ins' },
      { id: 't2', x: 1380, y: 340, color: 'green', label: 'window seat' },
      { id: 't3', x: 1380, y: 380, color: 'red', label: 'brass sconce' },
      { id: 't4', x: 1380, y: 420, color: 'yellow', label: 'cozy textile' },
      { id: 't5', x: 1380, y: 460, color: 'blue', label: 'slanted ceiling' },
    ],
    list: {
      id: 'l1', x: 1380, y: 540,
      title: 'To-do',
      sub: 'nook build',
      items: [
        { text: 'measure dormer + ceiling angles', done: true },
        { text: 'sketch window seat', done: false },
        { text: 'order plywood + trim', done: false },
        { text: 'pick paint (1 color, all surfaces)', done: false },
        { text: 'cushion fabric', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 260, y: 780,
      title: 'Phase plan',
      phases: [
        { label: 'Sketch + measure', meta: 'Apr — 1 wk', status: 'done' },
        { label: 'Build bench + bookcase', meta: 'May — wkds', status: 'active' },
        { label: 'Paint tonal', meta: 'Jun', status: 'todo' },
        { label: 'Cushion + styling', meta: 'Jul', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 840,
      title: 'Sourcing',
      items: [
        { name: "Mouse's Back paint", vendor: 'Farrow & Ball', price: '$120/gal', url: '#' },
        { name: 'Library picture light 14"', vendor: 'Schoolhouse', price: '$329', url: '#' },
        { name: 'Linen cushion fill', vendor: 'The Foam Factory', price: '$82', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1120, y: 840,
      title: 'Paint palette',
      chips: [
        { name: "Mouse's Back", vendor: 'Farrow & Ball', hex: '#726958', use: 'walls + built-ins (tonal)', code: 'No. 40' },
      ],
    },
  },

  'laundry': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 640, y: 660, color: 'green', rot: -2.8,
        text: "Skirt the counter — hides mess, adds pattern.\nNo upper cabs, just pegs.",
        author: 'M',
      },
      {
        id: 's2', x: 960, y: 640, color: 'yellow', rot: 2.5,
        text: "Need drying rack (wall-mount, folds up)\nPot filler over sink?",
        author: 'W',
      },
    ],
    tags: [
      { id: 't1', x: 1340, y: 300, color: 'red', label: 'gingham skirt' },
      { id: 't2', x: 1340, y: 340, color: 'blue', label: 'open shelving' },
      { id: 't3', x: 1340, y: 380, color: 'green', label: 'farmhouse sink' },
      { id: 't4', x: 1340, y: 420, color: 'yellow', label: 'basket storage' },
      { id: 't5', x: 1340, y: 460, color: 'red', label: 'peg rail' },
    ],
    list: {
      id: 'l1', x: 1340, y: 540,
      title: 'To-do',
      sub: 'utility + style',
      items: [
        { text: 'remove upper cabinets (DIY)', done: false },
        { text: 'install peg rail (DIY)', done: false },
        { text: 'sew counter skirt (DIY)', done: false },
        { text: 'plumb pot filler (plumber)', done: false },
        { text: 'electrical for sconces (electrician)', done: false },
        { text: 'basket audit — Amish market (DIY)', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 260, y: 780,
      title: 'Phase plan',
      phases: [
        { label: 'Demo uppers', meta: 'Aug — 1 day', status: 'todo' },
        { label: 'Plumb + electrical', meta: 'Aug', status: 'todo' },
        { label: 'Peg rail + shelf', meta: 'Sep', status: 'todo' },
        { label: 'Skirt + styling', meta: 'Sep', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 840,
      title: 'Sourcing',
      items: [
        { name: 'Fireclay apron sink 30"', vendor: 'Signature Hardware', price: '$895', url: '#' },
        { name: 'Green check linen', vendor: 'Rebecca Atwood', price: '$68/yd', url: '#' },
        { name: 'Shaker peg rail 4ft', vendor: 'Etsy — WoodenHorse', price: '$95', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1100, y: 840,
      title: 'Paint palette',
      chips: [
        { name: 'Green Smoke', vendor: 'Farrow & Ball', hex: '#6B7761', use: 'lower cabs', code: 'No. 47' },
        { name: 'Pointing', vendor: 'Farrow & Ball', hex: '#EFE8DB', use: 'walls + upper', code: 'No. 2003' },
      ],
    },
  },

  'library': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 620, y: 660, color: 'yellow', rot: -3,
        text: "Built-in books, floor to ceiling.\nRolling ladder??? (kids would love)",
        author: 'M',
      },
      {
        id: 's2', x: 970, y: 640, color: 'pink', rot: 2.8,
        text: "Keep toys in baskets on low shelf.\nAdults books up high.",
        author: 'W',
      },
    ],
    tags: [
      { id: 't1', x: 1340, y: 300, color: 'blue', label: 'built-in bookcase' },
      { id: 't2', x: 1340, y: 340, color: 'green', label: 'basket storage' },
      { id: 't3', x: 1340, y: 380, color: 'red', label: 'patterned rug' },
      { id: 't4', x: 1340, y: 420, color: 'yellow', label: 'reading nook' },
      { id: 't5', x: 1340, y: 460, color: 'blue', label: 'rolling ladder' },
    ],
    list: {
      id: 'l1', x: 1340, y: 540,
      title: 'To-do',
      sub: 'library build',
      items: [
        { text: 'measure wall + ceiling', done: true },
        { text: 'design bookcase (CAD)', done: false },
        { text: 'buy plywood + trim', done: false },
        { text: 'rug — hunt antique', done: false },
        { text: 'kid table — thrift?', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 260, y: 780,
      title: 'Phase plan',
      phases: [
        { label: 'Design + measure', meta: 'Apr', status: 'done' },
        { label: 'Build carcasses', meta: 'May — wkds', status: 'todo' },
        { label: 'Install + trim', meta: 'Jun', status: 'todo' },
        { label: 'Paint + style', meta: 'Jul', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 840,
      title: 'Sourcing',
      items: [
        { name: 'Maple plywood 3/4"', vendor: 'Home Depot', price: '$82/sheet', url: '#' },
        { name: 'Rolling library ladder kit', vendor: 'Rockler', price: '$485', url: '#' },
        { name: 'Antique Persian 6×9', vendor: 'eBay — saved search', price: '~$400', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1100, y: 840,
      title: 'Paint palette',
      chips: [
        { name: 'Hague Blue', vendor: 'Farrow & Ball', hex: '#30414A', use: 'bookcase interior', code: 'No. 30' },
        { name: 'School House White', vendor: 'Farrow & Ball', hex: '#E8DFCE', use: 'walls', code: 'No. 291' },
      ],
    },
  },

  'coffee-wet-bar': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 660, y: 640, color: 'yellow', rot: -3.2,
        text: "deVOL q's:\n• Real Shaker vs. Haberdasher's?\n• Can we spec Miele espresso built-in?",
        author: 'M',
      },
      {
        id: 's2', x: 1020, y: 660, color: 'pink', rot: 2.6,
        text: "Undercounter ice maker > mini fridge.\nWe will actually use ice.",
        author: 'W',
      },
      {
        id: 's3', x: 1260, y: 680, color: 'blue', rot: -2,
        text: "deVOL handles everything end-to-end.\nOur job: decisions + site access.",
        author: 'M',
      },
    ],
    tags: [
      { id: 't1', x: 1360, y: 300, color: 'blue', label: 'fluted glass cabs' },
      { id: 't2', x: 1360, y: 340, color: 'red', label: 'built-in espresso' },
      { id: 't3', x: 1360, y: 380, color: 'green', label: 'veined stone slab' },
      { id: 't4', x: 1360, y: 420, color: 'yellow', label: 'brass bar faucet' },
      { id: 't5', x: 1360, y: 460, color: 'red', label: 'backlit shelving' },
    ],
    list: {
      id: 'l1', x: 1360, y: 540,
      title: 'Our to-do',
      sub: 'with deVOL',
      items: [
        { text: 'kickoff call w/ deVOL designer', done: true },
        { text: 'send dims + photos of alcove', done: true },
        { text: 'approve layout option A or B', done: false },
        { text: 'pick cabinet style + finish', done: false },
        { text: 'espresso machine decision (Miele vs La Marzocco)', done: false },
        { text: 'stone slab — showroom walk w/ deVOL', done: false },
        { text: 'confirm install week w/ contractor', done: false },
      ],
    },
    timeline: {
      id: 'tm1', x: 260, y: 780,
      title: 'Phase plan — deVOL',
      phases: [
        { label: 'Kickoff + site survey', meta: 'Mar — done', status: 'done' },
        { label: 'Design + quote', meta: 'Apr', status: 'active' },
        { label: 'Sign-off + deposit', meta: 'May', status: 'todo' },
        { label: 'Cabinetry build (deVOL shop)', meta: 'Jun–Jul — 8 wks lead', status: 'todo' },
        { label: 'Install week', meta: 'Aug', status: 'todo' },
        { label: 'Appliances + styling', meta: 'Sep', status: 'todo' },
      ],
    },
    links: {
      id: 'lk1', x: 760, y: 840,
      title: 'Sourcing',
      items: [
        { name: 'Miele CM6350 built-in espresso', vendor: 'AJ Madison', price: '$2,699', url: '#' },
        { name: 'U-Line undercounter ice maker', vendor: 'Appliances Connection', price: '$1,850', url: '#' },
        { name: 'Waterworks Easton bar faucet — unlacquered brass', vendor: 'Waterworks', price: '$1,120', url: '#' },
        { name: 'Calacatta Viola slab (3cm)', vendor: 'Aria Stone Gallery', price: '~$180/sqft', url: '#' },
        { name: 'Reeded glass inserts (custom)', vendor: 'Semihandmade', price: 'quote', url: '#' },
      ],
    },
    paint: {
      id: 'pt1', x: 1100, y: 840,
      title: 'Paint palette',
      chips: [
        { name: 'Studio Green', vendor: 'Farrow & Ball', hex: '#2E3A30', use: 'lower cabinets', code: 'No. 93' },
        { name: 'Wimborne White', vendor: 'Farrow & Ball', hex: '#EFE8D7', use: 'upper cabs + trim', code: 'No. 239' },
        { name: 'Brass — unlacquered', vendor: 'n/a (metal)', hex: '#B08D42', use: 'hardware + faucet', code: '—' },
      ],
    },
  },

  'gym': {
    photos: [],
    stickies: [
      {
        id: 's1', x: 640, y: 640, color: 'yellow', rot: -2.5,
        text: "Rubber floor mats over existing concrete?\nMirror wall for form check.",
        author: 'M',
      },
    ],
    tags: [
      { id: 't1', x: 1340, y: 300, color: 'blue', label: 'mirror wall' },
      { id: 't2', x: 1340, y: 340, color: 'green', label: 'rubber flooring' },
      { id: 't3', x: 1340, y: 380, color: 'red', label: 'cable stack' },
      { id: 't4', x: 1340, y: 420, color: 'yellow', label: 'airflow / dehumidifier' },
    ],
    list: {
      id: 'l1', x: 1340, y: 500,
      title: 'To-do',
      sub: 'basement gym',
      items: [
        { text: 'measure ceiling height + joists', done: false },
        { text: 'floor plan — equipment layout', done: false },
        { text: 'order rubber flooring', done: false },
        { text: 'dehumidifier research', done: false },
      ],
    },
    paint: {
      id: 'pt1', x: 1080, y: 820,
      title: 'Paint palette',
      chips: [
        { name: 'Down Pipe', vendor: 'Farrow & Ball', hex: '#56605D', use: 'walls', code: 'No. 26' },
      ],
    },
  },
};

export { ROOMS, STARTER_BOARDS };
