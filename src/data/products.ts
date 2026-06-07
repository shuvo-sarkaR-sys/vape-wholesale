import { Product } from '../types';

export const HERO_BANNER = '/src/assets/images/luxury_smoke_banner_1780813987485.png';

export const PRODUCTS: Product[] = [
  {
    id: 'ps-01',
    name: 'Aether V-2 Vaporizing Modular Vessel',
    brand: 'Aether Technologies',
    category: 'Vaporizers',
    price: 145.00,
    suggestedMSRP: 299.00,
    image: '/src/assets/images/luxury_vaporizer_1780814002923.png',
    description: 'A masterpiece in thermostatic modular vaping. Crafted with hand-selected dark solid walnut side plates and a micro-brushed bead-blasted dark titanium body, featuring an advanced ultra-fine dual convection heating element.',
    rating: 4.9,
    specs: {
      material: 'Titanium & Dark Walnut Wood',
      dimensions: '112mm x 34mm x 22mm',
      origin: 'Portland, USA',
      capacity: '0.4g dried herbs / concentrates',
      inStock: true
    },
    features: [
      'Proportional thermostatic heating algorithm (+/- 1°C precision)',
      'Haptic feedback notification system',
      'Dual conduction/convection heat exchanger',
      'Solid-state aerospace ceramic oven chamber'
    ]
  },
  {
    id: 'ps-02',
    name: 'Monolith Spanish Cedar Smart Humidor',
    brand: 'Pacific Humidors',
    category: 'Curated Sets',
    price: 380.00,
    suggestedMSRP: 750.00,
    image: '/src/assets/images/smart_humidor_1780814016546.png',
    description: 'The climate-vault for rare cigar portfolios. Clad in custom milled obsidian slate glass with solid Spanish Cedar lining. Controlled via dual-stream micro-misting humidifier, calibrated dynamically through built-in e-paper sensors.',
    rating: 4.8,
    specs: {
      material: 'Spanish Cedar & Obsidian Slate Glass',
      dimensions: '310mm x 240mm x 165mm',
      origin: 'Munich, Germany',
      capacity: '75 Churchill-class cigars',
      inStock: true
    },
    features: [
      'Active ultrasonic humidification capsule',
      'Ultra-quiet brushless silent misting engine',
      'Dual-glazed UV-filtering safety glass',
      'Embedded solid copper hinges and precision latches'
    ]
  },
  {
    id: 'ps-03',
    name: 'Iridescent Fume Borosilicate Glass Vessel',
    brand: 'Glassworks Elite',
    category: 'Artisanal Pipes',
    price: 110.00,
    suggestedMSRP: 230.00,
    image: '/src/assets/images/glass_vessel_1780814033038.png',
    description: 'An ethereal luxury table pipe featuring beautiful micro-fumed gold and turquoise metallic vapor lines captured deep inside thick-walled borosilicate crystal. Perfect internal percolation channels for an ultra-smooth experience.',
    rating: 5.0,
    specs: {
      material: 'Thick Borosilicate Schott Crystal',
      dimensions: '145mm x 52mm x 48mm',
      origin: 'Seattle, USA',
      capacity: 'Deep-well flower chamber',
      inStock: true
    },
    features: [
      'Genuine 24k gold and silver chemical vapor fuming',
      'Double-walled cooling thermal barrier',
      'Flat ground base for beautiful marble stand stability',
      'Individually blown and initialed by the master glassblower'
    ]
  },
  {
    id: 'ps-04',
    name: 'Vessel Obsidian Pro Slate Holder',
    brand: 'Vessel Luxe',
    category: 'Vessels',
    price: 79.00,
    suggestedMSRP: 159.00,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'Ergonomic precision-weight cartridges vessel machined from standard carbon slate core. Houses 510 threaded custom oils and distillate units with luxury mechanical snap closing structure.',
    rating: 4.7,
    specs: {
      material: 'Premium anodized carbon alloy',
      dimensions: '94mm x 18mm x 14mm',
      origin: 'Vessel Labs, Tokyo',
      capacity: 'Fits all universal 510 cartridges',
      inStock: true
    },
    features: [
      'Magnetic direct-drop tactile cartridge chamber',
      'Dual-stage high-draw power output system',
      'Integrated hidden USB-C smart charging dock',
      'Weighted base for an incredibly solid hand hold'
    ]
  },
  {
    id: 'ps-05',
    name: 'Alabaster Marbled Cigar Ash Tray',
    brand: 'Obsidian Clay',
    category: 'Cigar Accessories',
    price: 68.00,
    suggestedMSRP: 135.00,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'Heavy architectural ashtray chiseled out of a single block of natural Grecian Alabaster marble, featuring four hand-polished cigar rests accented with genuine brushed solid brass inlays.',
    rating: 4.9,
    specs: {
      material: 'Grecian Alabaster & Brushed Brass',
      dimensions: '180mm x 180mm x 45mm',
      origin: 'Athens, Greece',
      capacity: 'Quadruple rest layout',
      inStock: true
    },
    features: [
      'High-gloss heat-impervious double-polished protective treatment',
      'Non-slip velvet protection backing on under-plate',
      'Heavy-weight anti-tip design (approx 2.4 kg)',
      'Natural uniquely striated marble grain'
    ]
  },
  {
    id: 'ps-06',
    name: 'The Connoisseur Travel Case Suite',
    brand: 'Pacific Humidors',
    category: 'Curated Sets',
    price: 160.00,
    suggestedMSRP: 320.00,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A luxury portable travel suite. Contains a custom-lined heavy mahogany travel case, a precision double-guillotine self-sharpening cigar cutter, and a premium double-jet torch flame stormproof lighter.',
    rating: 4.8,
    specs: {
      material: 'Mahogany wood & Full-Grain Calf leather',
      dimensions: '220mm x 135mm x 55mm',
      origin: 'Milan, Italy',
      capacity: 'Holds 4 premium robusto-length cigars',
      inStock: true
    },
    features: [
      'Surgical grade 440C stainless steel double cutter blades',
      'Full grain textured leather cover wraps',
      'Internal humidification humidity-releasing stick slot',
      'Heavy brass accent clasps for robust safety'
    ]
  },
  {
    id: 'ps-07',
    name: 'Raw Lava Stone Incense Vessel',
    brand: 'Obsidian Clay',
    category: 'Vessels',
    price: 54.00,
    suggestedMSRP: 110.00,
    image: 'https://images.unsplash.com/photo-1603006905553-ec52f8a84d72?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A beautiful slow-cooling thermal raw lava stone burning vessel. Perfectly holds both incense cones and specialty essential-oil heating plates. Features a textured volcanic surface that retains and radiates ambient heat.',
    rating: 4.6,
    specs: {
      material: 'Vitreous basalt lava stone',
      dimensions: '90mm diameter x 80mm height',
      origin: 'Reykjavík, Iceland',
      capacity: 'Multi-functional core chamber',
      inStock: true
    },
    features: [
      'Porous stone surface naturally diffuses essential oils',
      'Includes brass accessory mesh for direct coal positioning',
      'High temperature physical resilience up to 1200°C',
      'Each item possesses its own basalt grain signature'
    ]
  },
  {
    id: 'ps-08',
    name: 'Pacific Heritage Brass Pipe Carver',
    brand: 'Glassworks Elite',
    category: 'Artisanal Pipes',
    price: 95.00,
    suggestedMSRP: 190.00,
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A solid billet-machined brass dry-herb pipe with internal spiraled cooling draw path designed for natural thermal dissipations. Fully disassembles for straightforward sanitization.',
    rating: 4.7,
    specs: {
      material: 'C360 Solid Surgical Instrument Brass',
      dimensions: '105mm x 20mm x 16mm',
      origin: 'San Francisco, USA',
      capacity: 'Integrated screen bowl',
      inStock: false
    },
    features: [
      'Precision internal vortex smoke-cooler design',
      'Magnetic press-fit lid for on-the-go security',
      'Modular three-part threaded design',
      'Zero synthetic materials used in construction'
    ]
  },
  {
    id: 'ps-09',
    name: 'Apex Air 20k Premium Quartz Disposable',
    brand: 'Apex Labs',
    category: 'Disposables',
    price: 18.50,
    suggestedMSRP: 39.99,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'A luxurious solid quartz glass disposable unit featuring full sub-ohm mesh coils and dual-chamber temperature controllers. Generates extremely rich, terpene-focused vapour streams without synthetic aftertastes.',
    rating: 4.9,
    specs: {
      material: 'Anodized Slate & Fused Quartz',
      dimensions: '88mm x 42mm x 18mm',
      origin: 'Vancouver, Canada',
      capacity: '20,000 calibrated puffs',
      inStock: true
    },
    features: [
      'E-Paper status readout for inventory tracking',
      'Direct-to-lung sub-ohm dual mesh atomizer',
      'Smart 650mAh safe-cell rechargeable battery via USB-C',
      'Naturally derived premium botanical terpene profiles'
    ]
  },
  {
    id: 'ps-10',
    name: 'Vessel Satin Brass Pod System v4',
    brand: 'Vessel Luxe',
    category: 'Pod Systems',
    price: 48.00,
    suggestedMSRP: 99.00,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'The absolute gold standard in refillable magnetic pod systems. Machined from high-density satin brass billet cores with fine micro-knurled active grip bands. Precision calibrated for viscous wholesale concentrates.',
    rating: 5.0,
    specs: {
      material: 'Surgical Stainless Steel & Satin Brass',
      dimensions: '108mm x 15mm x 12mm',
      origin: 'Tokyo, Japan',
      capacity: '2.0mL magnetic lock pods',
      inStock: true
    },
    features: [
      'Automatic draw-activation with smart temperature curve response',
      'Aero-vessel magnetic docking system with no friction latches',
      'Adjustable lower airflow selector ring (3 variants)',
      'Haptic feedback trigger for dynamic inhale metering'
    ]
  },
  {
    id: 'ps-11',
    name: 'Nectar Noir Barrel Aged Reserve (60mL)',
    brand: 'Nectar Alchemy',
    category: 'E-Liquid',
    price: 12.00,
    suggestedMSRP: 28.00,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'Premium oak-barrel aged tobacco distillates blended with Madagascar vanilla beans and toasted hazelnut extracts. Crafted carefully in small batches and certified diacetyl-free for selective boutique outlets.',
    rating: 4.8,
    specs: {
      material: 'Pharma-grade USP glycerins & flavorings',
      dimensions: '60mL Amber UV-glass dropper bottle',
      origin: 'Paris, France',
      capacity: '60mL volume (3mg Premium Salt-Nic)',
      inStock: true
    },
    features: [
      'Aged in toasted white oak barrels for 90 days',
      'Child-resistant glass dropper caps with tamper evident seals',
      'Detailed batch analysis QR-code printed on bottom label',
      'Smooth, high-density cloud production ratio (70VG/30PG)'
    ]
  },
  {
    id: 'ps-12',
    name: 'Omni-Heater Inductive Quartz Enail',
    brand: 'Aether Technologies',
    category: 'Hardware',
    price: 185.00,
    suggestedMSRP: 399.00,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800&h=600',
    description: 'The pinnacle of smart induction hardware. This laboratory-grade desktop heater safely creates surrounding electromagnetic currents to heat pure quartz cups to target temperatures in under five seconds.',
    rating: 4.9,
    specs: {
      material: 'Carbon Fiber & Aerospace Boron-Steel',
      dimensions: '130mm x 130mm x 95mm',
      origin: 'Zürich, Switzerland',
      capacity: 'Fully adjustable automatic thermal controller',
      inStock: true
    },
    features: [
      'Advanced induction electromagnet loop (zero exposed heating element)',
      'Dual multi-zone temperature sensor checking (up to 800°F)',
      'Automatic shut-off failsafe trigger if left unattended',
      'Bluetooth digital tracking dashboard for custom heat profile presets'
    ]
  }
];
