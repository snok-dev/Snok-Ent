// =====================================================================
//  PRODUCT CATALOGUE
//  To add a product, copy one block { ... }, paste it, and change the values.
//  - id:              short unique name, no spaces (used in the web address)
//  - retailPrice:     price for one unit, in Naira
//  - wholesalePrice:  price per unit when buying wholesaleMinQty or more
//  - inStock:         true or false
//  - featured:        true to show on the home page
//  - image:           (optional) link to a photo, e.g. "images/panel-550w.jpg"
//  - kva / kwh / watts / volts: used by the Solar Calculator to recommend products
//  NOTE: prices below are SAMPLE prices - replace them with your real prices.
// =====================================================================

const CATEGORIES = [
  { id: "solar-panels", name: "Solar Panels" },
  { id: "inverters", name: "Inverters" },
  { id: "batteries", name: "Batteries" },
  { id: "charge-controllers", name: "Charge Controllers" },
  { id: "solar-kits", name: "Complete Solar Kits" },
  { id: "solar-lights", name: "Solar Lights" },
  { id: "accessories", name: "Cables & Accessories" }
];

const PRODUCTS = [
  // ----- Solar panels -----
  {
    id: "panel-550w-mono",
    name: "550W Monocrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 175000,
    wholesalePrice: 158000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: true,
    watts: 550,
    description: "High-efficiency mono PERC half-cut panel. Ideal for home and commercial installations where roof space matters.",
    specs: { "Power": "550W", "Type": "Monocrystalline (half-cut)", "Efficiency": "Up to 21%", "Size": "2279 × 1134 × 35 mm", "Warranty": "Ask for details" }
  },
  {
    id: "panel-450w-mono",
    name: "450W Monocrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 145000,
    wholesalePrice: 130000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    watts: 450,
    description: "Reliable mono panel with a strong balance of price and power.",
    specs: { "Power": "450W", "Type": "Monocrystalline", "Efficiency": "Up to 20.5%", "Warranty": "Ask for details" }
  },
  {
    id: "panel-300w-mono",
    name: "300W Monocrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 98000,
    wholesalePrice: 88000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    watts: 300,
    description: "Compact panel for small systems, kiosks and starter home setups.",
    specs: { "Power": "300W", "Type": "Monocrystalline", "Warranty": "Ask for details" }
  },
  {
    id: "panel-200w-poly",
    name: "200W Polycrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 68000,
    wholesalePrice: 60000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    watts: 200,
    description: "Budget-friendly poly panel for lighting systems and small loads.",
    specs: { "Power": "200W", "Type": "Polycrystalline", "Warranty": "Ask for details" }
  },
  {
    id: "panel-100w-foldable",
    name: "100W Foldable Portable Solar Panel",
    category: "solar-panels",
    retailPrice: 75000,
    wholesalePrice: 66000,
    wholesaleMinQty: 5,
    inStock: false,
    featured: false,
    watts: 100,
    description: "Lightweight folding panel with carry handle. Great for power stations, travel and outdoor work.",
    specs: { "Power": "100W", "Outputs": "USB-A, USB-C, DC", "Weight": "About 4kg" }
  },

  // ----- Inverters -----
  {
    id: "inverter-1kva-12v",
    name: "1kVA 12V Pure Sine Wave Inverter",
    category: "inverters",
    retailPrice: 145000,
    wholesalePrice: 128000,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    kva: 1,
    volts: 12,
    description: "Entry-level pure sine wave inverter for lights, fans, TV and phone charging.",
    specs: { "Capacity": "1kVA / 800W", "Battery voltage": "12V", "Output": "Pure sine wave", "Charger": "Built-in" }
  },
  {
    id: "inverter-2-5kva-24v",
    name: "2.5kVA 24V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 385000,
    wholesalePrice: 350000,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    kva: 2.5,
    volts: 24,
    description: "Hybrid inverter with built-in MPPT solar charge controller. Runs from solar, grid and battery.",
    specs: { "Capacity": "2.5kVA / 2000W", "Battery voltage": "24V", "Solar controller": "Built-in MPPT", "Output": "Pure sine wave" }
  },
  {
    id: "inverter-3-5kva-24v",
    name: "3.5kVA 24V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 520000,
    wholesalePrice: 475000,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    kva: 3.5,
    volts: 24,
    description: "Popular choice for Nigerian homes. Powers a fridge, TVs, fans, lights and more, with built-in MPPT.",
    specs: { "Capacity": "3.5kVA / 3000W", "Battery voltage": "24V", "Solar controller": "Built-in MPPT", "Max PV input": "4000W" }
  },
  {
    id: "inverter-5kva-48v",
    name: "5kVA 48V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 780000,
    wholesalePrice: 720000,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    kva: 5,
    volts: 48,
    description: "Powerful hybrid inverter for larger homes and small offices. Supports lithium batteries.",
    specs: { "Capacity": "5kVA / 5000W", "Battery voltage": "48V", "Solar controller": "Built-in MPPT", "Max PV input": "6000W" }
  },
  {
    id: "inverter-10kva-48v",
    name: "10kVA 48V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 1650000,
    wholesalePrice: 1520000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    kva: 10,
    volts: 48,
    description: "Commercial-grade inverter for offices, shops, schools and large homes with heavy loads.",
    specs: { "Capacity": "10kVA / 10000W", "Battery voltage": "48V", "Solar controller": "Dual MPPT", "Parallel": "Supported" }
  },

  // ----- Batteries -----
  {
    id: "battery-100ah-agm",
    name: "100Ah 12V Deep Cycle AGM Battery",
    category: "batteries",
    retailPrice: 185000,
    wholesalePrice: 168000,
    wholesaleMinQty: 4,
    inStock: true,
    featured: false,
    kwh: 1.2,
    volts: 12,
    description: "Maintenance-free sealed deep cycle battery for small inverter systems.",
    specs: { "Capacity": "100Ah", "Voltage": "12V", "Type": "AGM (sealed)", "Energy": "1.2kWh" }
  },
  {
    id: "battery-200ah-tubular",
    name: "200Ah 12V Tubular Battery",
    category: "batteries",
    retailPrice: 395000,
    wholesalePrice: 365000,
    wholesaleMinQty: 4,
    inStock: true,
    featured: false,
    kwh: 2.4,
    volts: 12,
    description: "Long-lasting tubular battery built for frequent charging and discharging.",
    specs: { "Capacity": "200Ah", "Voltage": "12V", "Type": "Tubular (flooded)", "Energy": "2.4kWh" }
  },
  {
    id: "battery-2-5kwh-lithium",
    name: "2.5kWh 24V Lithium (LiFePO4) Battery",
    category: "batteries",
    retailPrice: 950000,
    wholesalePrice: 880000,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    kwh: 2.5,
    volts: 24,
    description: "Lithium iron phosphate battery with built-in BMS. Lasts many more cycles than lead-acid.",
    specs: { "Energy": "2.5kWh", "Voltage": "24V", "Chemistry": "LiFePO4", "Cycle life": "6000+ cycles" }
  },
  {
    id: "battery-5kwh-lithium",
    name: "5kWh 48V Lithium (LiFePO4) Battery",
    category: "batteries",
    retailPrice: 1650000,
    wholesalePrice: 1530000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: true,
    kwh: 5,
    volts: 48,
    description: "Wall or rack-mounted lithium battery. Pairs perfectly with 5kVA and 10kVA 48V inverters.",
    specs: { "Energy": "5kWh", "Voltage": "48V", "Chemistry": "LiFePO4", "Cycle life": "6000+ cycles", "Communication": "CAN / RS485" }
  },
  {
    id: "battery-10kwh-lithium",
    name: "10kWh 48V Lithium (LiFePO4) Battery",
    category: "batteries",
    retailPrice: 3100000,
    wholesalePrice: 2880000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    kwh: 10,
    volts: 48,
    description: "High-capacity lithium storage for all-day and all-night power.",
    specs: { "Energy": "10kWh", "Voltage": "48V", "Chemistry": "LiFePO4", "Cycle life": "6000+ cycles" }
  },

  // ----- Charge controllers -----
  {
    id: "controller-pwm-30a",
    name: "30A PWM Solar Charge Controller",
    category: "charge-controllers",
    retailPrice: 18000,
    wholesalePrice: 15000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Simple, affordable controller for small solar lighting systems.",
    specs: { "Current": "30A", "Voltage": "12V / 24V auto", "Type": "PWM", "USB output": "Yes" }
  },
  {
    id: "controller-mppt-60a",
    name: "60A MPPT Solar Charge Controller",
    category: "charge-controllers",
    retailPrice: 165000,
    wholesalePrice: 150000,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    description: "Efficient MPPT controller that gets up to 30% more from your panels than PWM.",
    specs: { "Current": "60A", "Voltage": "12V / 24V / 48V auto", "Type": "MPPT", "Max PV voltage": "150V" }
  },
  {
    id: "controller-mppt-100a",
    name: "100A MPPT Solar Charge Controller",
    category: "charge-controllers",
    retailPrice: 285000,
    wholesalePrice: 260000,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Heavy-duty MPPT controller for large panel arrays.",
    specs: { "Current": "100A", "Voltage": "12V / 24V / 48V auto", "Type": "MPPT", "Max PV voltage": "250V" }
  },

  // ----- Complete kits -----
  {
    id: "kit-1kva-starter",
    name: "1kVA Home Starter Solar Kit",
    category: "solar-kits",
    retailPrice: 720000,
    wholesalePrice: 670000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: true,
    description: "Everything you need to power lights, fans, TV and phones: inverter, battery, panels and accessories.",
    specs: { "Inverter": "1kVA 12V", "Battery": "1 × 200Ah tubular", "Panels": "2 × 300W", "Includes": "Controller, cables, breakers" }
  },
  {
    id: "kit-3-5kva-lithium",
    name: "3.5kVA Lithium Solar Kit",
    category: "solar-kits",
    retailPrice: 2350000,
    wholesalePrice: 2200000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: true,
    description: "Complete system for a typical family home, including a fridge, with long-life lithium storage.",
    specs: { "Inverter": "3.5kVA 24V hybrid", "Battery": "2.5kWh lithium", "Panels": "4 × 550W", "Includes": "Cables, breakers, mounting" }
  },
  {
    id: "kit-5kva-lithium",
    name: "5kVA Lithium Solar Kit",
    category: "solar-kits",
    retailPrice: 3650000,
    wholesalePrice: 3420000,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    description: "Powerful kit for larger homes and offices: run a freezer, pumps and more.",
    specs: { "Inverter": "5kVA 48V hybrid", "Battery": "5kWh lithium", "Panels": "6 × 550W", "Includes": "Cables, breakers, mounting" }
  },

  // ----- Solar lights -----
  {
    id: "light-street-100w",
    name: "100W All-in-One Solar Street Light",
    category: "solar-lights",
    retailPrice: 58000,
    wholesalePrice: 48000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: true,
    description: "Panel, battery and light in one unit with motion sensor. Ideal for compounds, estates and streets.",
    specs: { "Power": "100W", "Sensor": "Motion + dusk-to-dawn", "Runtime": "Up to 12 hours" }
  },
  {
    id: "light-flood-200w",
    name: "200W Solar Flood Light with Remote",
    category: "solar-lights",
    retailPrice: 42000,
    wholesalePrice: 35000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Bright flood light with separate panel and remote control timer.",
    specs: { "Power": "200W", "Control": "Remote with timer", "Waterproof": "IP66" }
  },
  {
    id: "light-lantern",
    name: "Rechargeable Solar Lantern with Phone Charging",
    category: "solar-lights",
    retailPrice: 9500,
    wholesalePrice: 7500,
    wholesaleMinQty: 20,
    inStock: true,
    featured: false,
    description: "Portable lantern that charges in the sun and can charge your phone.",
    specs: { "Charging": "Solar or USB", "Output": "USB phone charging" }
  },

  // ----- Cables & accessories -----
  {
    id: "cable-6mm-100m",
    name: "6mm² Solar DC Cable (100m roll)",
    category: "accessories",
    retailPrice: 145000,
    wholesalePrice: 130000,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    description: "UV-resistant tinned copper cable for connecting solar panels.",
    specs: { "Size": "6mm²", "Length": "100m", "Colour": "Red or black" }
  },
  {
    id: "mc4-connectors-10",
    name: "MC4 Solar Connectors (10 pairs)",
    category: "accessories",
    retailPrice: 9000,
    wholesalePrice: 7000,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Waterproof connectors for panel wiring.",
    specs: { "Quantity": "10 pairs", "Rating": "30A / 1000V DC" }
  },
  {
    id: "dc-breaker-63a",
    name: "63A DC Circuit Breaker",
    category: "accessories",
    retailPrice: 8500,
    wholesalePrice: 6800,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Protects your solar and battery circuits.",
    specs: { "Rating": "63A", "Voltage": "Up to 500V DC" }
  },
  {
    id: "battery-cable-35mm",
    name: "35mm² Battery Cable Set",
    category: "accessories",
    retailPrice: 22000,
    wholesalePrice: 18500,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Pre-made cables with lugs for connecting batteries to your inverter.",
    specs: { "Size": "35mm²", "Includes": "Red + black cable with lugs" }
  },
  {
    id: "mounting-kit-4",
    name: "Solar Panel Roof Mounting Kit (4 panels)",
    category: "accessories",
    retailPrice: 65000,
    wholesalePrice: 58000,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    description: "Aluminium rails, clamps and hooks to fix up to 4 panels on a roof.",
    specs: { "Fits": "Up to 4 panels", "Material": "Anodised aluminium" }
  }
];
