// =====================================================================
//  PRODUCT CATALOGUE
//  To add a product, copy one block { ... }, paste it, and change the values.
//  - id:              short unique name, no spaces (used in the web address)
//  - retailPrice:     price for one unit, in pounds (£), including VAT
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
  { id: "accessories", name: "Cables & Accessories" },
  { id: "inverter-acs", name: "Air Conditioners & Heat Pumps" },
  { id: "inverter-fridges", name: "Inverter Fridges & Freezers" },
  { id: "home-appliances", name: "Energy-Saving Appliances" }
];

const PRODUCTS = [
  // ----- Solar panels -----
  {
    id: "panel-550w-mono",
    name: "550W Monocrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 129,
    wholesalePrice: 105,
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
    retailPrice: 109,
    wholesalePrice: 89,
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
    retailPrice: 85,
    wholesalePrice: 69,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    watts: 300,
    description: "Compact panel for sheds, garden rooms, caravans and small starter systems.",
    specs: { "Power": "300W", "Type": "Monocrystalline", "Warranty": "Ask for details" }
  },
  {
    id: "panel-200w-poly",
    name: "200W Polycrystalline Solar Panel",
    category: "solar-panels",
    retailPrice: 69,
    wholesalePrice: 55,
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
    retailPrice: 119,
    wholesalePrice: 95,
    wholesaleMinQty: 5,
    inStock: false,
    featured: false,
    watts: 100,
    description: "Lightweight folding panel with carry handle. Great for portable power stations, camping, campervans and festivals.",
    specs: { "Power": "100W", "Outputs": "USB-A, USB-C, DC", "Weight": "About 4kg" }
  },

  // ----- Inverters -----
  {
    id: "inverter-1kva-12v",
    name: "1kVA 12V Pure Sine Wave Inverter",
    category: "inverters",
    retailPrice: 165,
    wholesalePrice: 135,
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
    retailPrice: 429,
    wholesalePrice: 375,
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
    retailPrice: 569,
    wholesalePrice: 499,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    kva: 3.5,
    volts: 24,
    description: "Popular choice for UK homes adding solar and battery storage. Built-in MPPT solar charger and backup during power cuts.",
    specs: { "Capacity": "3.5kVA / 3000W", "Battery voltage": "24V", "Solar controller": "Built-in MPPT", "Max PV input": "4000W" }
  },
  {
    id: "inverter-5kva-48v",
    name: "5kVA 48V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 849,
    wholesalePrice: 759,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    kva: 5,
    volts: 48,
    description: "Powerful hybrid inverter for larger homes and small offices. Supports lithium batteries and time-of-use tariff charging.",
    specs: { "Capacity": "5kVA / 5000W", "Battery voltage": "48V", "Solar controller": "Built-in MPPT", "Max PV input": "6000W" }
  },
  {
    id: "inverter-10kva-48v",
    name: "10kVA 48V Hybrid Solar Inverter",
    category: "inverters",
    retailPrice: 1649,
    wholesalePrice: 1479,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    kva: 10,
    volts: 48,
    description: "Commercial-grade inverter for offices, shops, farms, schools and large homes with heavy loads.",
    specs: { "Capacity": "10kVA / 10000W", "Battery voltage": "48V", "Solar controller": "Dual MPPT", "Parallel": "Supported" }
  },

  // ----- Batteries -----
  {
    id: "battery-100ah-agm",
    name: "100Ah 12V Deep Cycle AGM Battery",
    category: "batteries",
    retailPrice: 189,
    wholesalePrice: 159,
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
    retailPrice: 379,
    wholesalePrice: 329,
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
    retailPrice: 849,
    wholesalePrice: 759,
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
    retailPrice: 1449,
    wholesalePrice: 1299,
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
    retailPrice: 2699,
    wholesalePrice: 2449,
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
    retailPrice: 25,
    wholesalePrice: 19,
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
    retailPrice: 209,
    wholesalePrice: 185,
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
    retailPrice: 359,
    wholesalePrice: 319,
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
    retailPrice: 699,
    wholesalePrice: 629,
    wholesaleMinQty: 2,
    inStock: true,
    featured: true,
    description: "Everything you need for a garden office, workshop, shed or cabin: inverter, battery, panels and accessories.",
    specs: { "Inverter": "1kVA 12V", "Battery": "1 × 200Ah tubular", "Panels": "2 × 300W", "Includes": "Controller, cables, breakers" }
  },
  {
    id: "kit-3-5kva-lithium",
    name: "3.5kVA Lithium Solar Kit",
    category: "solar-kits",
    retailPrice: 2649,
    wholesalePrice: 2399,
    wholesaleMinQty: 2,
    inStock: true,
    featured: true,
    description: "Complete system for a typical family home, with long-life lithium storage to use your solar power in the evening.",
    specs: { "Inverter": "3.5kVA 24V hybrid", "Battery": "2.5kWh lithium", "Panels": "4 × 550W", "Includes": "Cables, breakers, mounting" }
  },
  {
    id: "kit-5kva-lithium",
    name: "5kVA Lithium Solar Kit",
    category: "solar-kits",
    retailPrice: 3949,
    wholesalePrice: 3599,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    description: "Powerful kit for larger homes and small businesses, with plenty of storage to cut your energy bills.",
    specs: { "Inverter": "5kVA 48V hybrid", "Battery": "5kWh lithium", "Panels": "6 × 550W", "Includes": "Cables, breakers, mounting" }
  },

  // ----- Solar lights -----
  {
    id: "light-street-100w",
    name: "100W All-in-One Solar Street Light",
    category: "solar-lights",
    retailPrice: 79,
    wholesalePrice: 59,
    wholesaleMinQty: 10,
    inStock: true,
    featured: true,
    description: "Panel, battery and light in one unit with motion sensor. Ideal for driveways, car parks, farms and yards.",
    specs: { "Power": "100W", "Sensor": "Motion + dusk-to-dawn", "Runtime": "Up to 12 hours" }
  },
  {
    id: "light-flood-200w",
    name: "200W Solar Flood Light with Remote",
    category: "solar-lights",
    retailPrice: 55,
    wholesalePrice: 42,
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
    retailPrice: 19,
    wholesalePrice: 14,
    wholesaleMinQty: 20,
    inStock: true,
    featured: false,
    description: "Portable lantern that charges in the sun and can charge your phone. Handy for camping and emergency kits.",
    specs: { "Charging": "Solar or USB", "Output": "USB phone charging" }
  },

  // ----- Cables & accessories -----
  {
    id: "cable-6mm-100m",
    name: "6mm² Solar DC Cable (100m roll)",
    category: "accessories",
    retailPrice: 95,
    wholesalePrice: 79,
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
    retailPrice: 15,
    wholesalePrice: 11,
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
    retailPrice: 18,
    wholesalePrice: 13,
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
    retailPrice: 35,
    wholesalePrice: 27,
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
    retailPrice: 119,
    wholesalePrice: 99,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    description: "Aluminium rails, clamps and hooks to fix up to 4 panels on a roof.",
    specs: { "Fits": "Up to 4 panels", "Material": "Anodised aluminium" }
  },

  // ----- Inverter air conditioners -----
  {
    id: "ac-1hp-inverter",
    name: "9,000 BTU Inverter Air Conditioner & Heat Pump",
    category: "inverter-acs",
    retailPrice: 649,
    wholesalePrice: 589,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Cools in summer and heats efficiently in winter. The inverter compressor adjusts its speed instead of switching on and off, using far less power than older units. Ideal for bedrooms and home offices.",
    specs: { "Cooling": "9,000 BTU", "Power use": "About 300 – 800W", "Refrigerant": "R32 (eco-friendly)", "Heating": "Yes (heat pump)", "Works with": "2.5kVA inverter and above", "Installation": "Must be fitted by an F-gas certified engineer" }
  },
  {
    id: "ac-1-5hp-inverter",
    name: "12,000 BTU Inverter Air Conditioner & Heat Pump",
    category: "inverter-acs",
    retailPrice: 799,
    wholesalePrice: 719,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    description: "Air-to-air heat pump for living rooms and offices: efficient heating in winter and cooling in summer, with a gentle start-up that's kind to solar and battery systems.",
    specs: { "Cooling": "12,000 BTU", "Power use": "About 400 – 1,100W", "Refrigerant": "R32 (eco-friendly)", "Heating": "Yes (heat pump)", "Works with": "3.5kVA inverter and above", "Modes": "Cool, Heat, Dry, Fan, Sleep" }
  },
  {
    id: "ac-2hp-inverter",
    name: "18,000 BTU Inverter Air Conditioner & Heat Pump",
    category: "inverter-acs",
    retailPrice: 1099,
    wholesalePrice: 989,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Powerful heating and cooling for open-plan spaces, offices and shops.",
    specs: { "Cooling": "18,000 BTU", "Power use": "About 600 – 1,600W", "Refrigerant": "R32 (eco-friendly)", "Heating": "Yes (heat pump)", "Works with": "5kVA inverter and above" }
  },
  {
    id: "ac-1-5hp-solar-hybrid",
    name: "12,000 BTU Solar Hybrid Air Conditioner & Heat Pump",
    category: "inverter-acs",
    retailPrice: 1649,
    wholesalePrice: 1499,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    description: "Runs directly from solar panels during the day and switches to the grid or your battery at night, cutting running costs.",
    specs: { "Cooling": "12,000 BTU", "Power sources": "Solar panels (DC) + grid/inverter (AC)", "Panels needed": "3 – 4 × 550W", "Compressor": "DC inverter" }
  },

  // ----- Inverter fridges & freezers -----
  {
    id: "fridge-200l-inverter",
    name: "200L Inverter Double-Door Refrigerator",
    category: "inverter-fridges",
    retailPrice: 399,
    wholesalePrice: 355,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Inverter compressor keeps food cold using very little power: ideal for homes on solar or inverter backup.",
    specs: { "Capacity": "200 litres", "Power use": "About 0.6 kWh per day", "Compressor": "Inverter", "Doors": "Top freezer + fridge" }
  },
  {
    id: "fridge-350l-inverter",
    name: "350L Frost-Free Inverter Refrigerator",
    category: "inverter-fridges",
    retailPrice: 749,
    wholesalePrice: 679,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    description: "Large frost-free fridge freezer with inverter compressor, so there's no defrosting and power use stays low.",
    specs: { "Capacity": "350 litres", "Power use": "About 0.9 kWh per day", "Compressor": "Inverter", "Frost-free": "Yes" }
  },
  {
    id: "freezer-200l-inverter",
    name: "200L Inverter Chest Freezer",
    category: "inverter-fridges",
    retailPrice: 329,
    wholesalePrice: 289,
    wholesaleMinQty: 3,
    inStock: true,
    featured: true,
    description: "Energy-saving chest freezer that holds its temperature for hours during power cuts.",
    specs: { "Capacity": "200 litres", "Power use": "About 0.7 kWh per day", "Compressor": "Inverter", "Cold retention": "Up to 30 hours" }
  },
  {
    id: "freezer-300l-inverter",
    name: "300L Inverter Chest Freezer",
    category: "inverter-fridges",
    retailPrice: 429,
    wholesalePrice: 379,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Big storage for families, farm shops, cafés and restaurants, with low power use.",
    specs: { "Capacity": "300 litres", "Power use": "About 0.9 kWh per day", "Compressor": "Inverter", "Modes": "Freezer / Chiller switchable" }
  },
  {
    id: "freezer-228l-dc-solar",
    name: "228L DC Solar Chest Freezer (12/24V)",
    category: "inverter-fridges",
    retailPrice: 899,
    wholesalePrice: 799,
    wholesaleMinQty: 2,
    inStock: true,
    featured: false,
    description: "Runs straight from a 12V or 24V battery and solar panel, with no inverter needed. Perfect for off-grid cabins, boats and caravans.",
    specs: { "Capacity": "228 litres", "Voltage": "12V / 24V DC", "Compressor": "DC inverter", "Panels needed": "2 × 300W or more" }
  },

  // ----- Energy-saving appliances -----
  {
    id: "washer-8kg-inverter",
    name: "8kg Front-Load Washing Machine (Inverter Motor)",
    category: "home-appliances",
    retailPrice: 449,
    wholesalePrice: 399,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Quiet inverter motor uses less power and water than regular washing machines.",
    specs: { "Capacity": "8kg", "Motor": "Inverter direct drive", "Spin speed": "1,200 rpm", "Programmes": "15" }
  },
  {
    id: "microwave-25l-inverter",
    name: "25L Inverter Microwave Oven",
    category: "home-appliances",
    retailPrice: 169,
    wholesalePrice: 145,
    wholesaleMinQty: 5,
    inStock: true,
    featured: false,
    description: "Inverter heating gives steady, even cooking and defrosting with lower power draw.",
    specs: { "Capacity": "25 litres", "Power": "900W, inverter controlled", "Functions": "Cook, defrost, grill" }
  },
  {
    id: "induction-cooker-2000w",
    name: "2000W Inverter Induction Cooker",
    category: "home-appliances",
    retailPrice: 79,
    wholesalePrice: 65,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Fast, efficient electric cooking. Adjustable power levels, so you can match it to your inverter or solar output.",
    specs: { "Power": "200 – 2,000W adjustable", "Works with": "Iron and steel pots", "Safety": "Auto shut-off, child lock" }
  },
  {
    id: "fan-56-bldc",
    name: "56-inch BLDC Inverter Ceiling Fan (35W)",
    category: "home-appliances",
    retailPrice: 149,
    wholesalePrice: 129,
    wholesaleMinQty: 10,
    inStock: true,
    featured: true,
    description: "Brushless DC inverter motor uses about half the power of a normal ceiling fan, so it runs much longer on batteries.",
    specs: { "Size": "56 inches", "Power use": "35W at full speed", "Control": "Remote control", "Motor": "BLDC inverter" }
  },
  {
    id: "fan-16-rechargeable",
    name: "16-inch Rechargeable Solar-Ready Standing Fan",
    category: "home-appliances",
    retailPrice: 89,
    wholesalePrice: 74,
    wholesaleMinQty: 10,
    inStock: true,
    featured: false,
    description: "Built-in battery and solar input. Cordless cooling for heatwaves, garden rooms and power cuts.",
    specs: { "Size": "16 inches", "Battery": "Built-in, up to 8 hours", "Charging": "AC or solar panel", "Extras": "LED light, USB charging" }
  },
  {
    id: "pump-1hp-inverter",
    name: "1HP Inverter (Variable-Speed) Water Pump",
    category: "home-appliances",
    retailPrice: 399,
    wholesalePrice: 355,
    wholesaleMinQty: 3,
    inStock: true,
    featured: false,
    description: "Soft-start inverter pump for boreholes, rainwater harvesting and garden irrigation. No big power surge when it starts.",
    specs: { "Power": "750W", "Start-up": "Soft start (no surge)", "Max height": "40m" }
  },
  {
    id: "iron-1000w-dry",
    name: "1000W Low-Wattage Dry Iron (Solar-Friendly)",
    category: "home-appliances",
    retailPrice: 29,
    wholesalePrice: 22,
    wholesaleMinQty: 20,
    inStock: true,
    featured: false,
    description: "Irons don't use inverter technology, but this low-wattage model is light on your inverter and batteries compared with typical 2000W+ irons.",
    specs: { "Power": "1000W", "Type": "Dry iron", "Soleplate": "Non-stick", "Works with": "1.5kVA inverter and above" }
  }
];
