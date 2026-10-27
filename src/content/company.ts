// Corvane Geospatial is a fictional company created for this website concept.
// Every name, project, person and quote below is invented for demonstration.
export const company = {
  name: 'Corvane Geospatial', short: 'Corvane', founded: 2003,
  // 0491 570 156 sits in ACMA's range reserved for fictional use, so it never reaches a real person.
  phone: '0491 570 156', tel: '+61491570156',
  // The .example domain is reserved and never delivers mail.
  email: 'hello@corvane.example',
  address: 'Elizabeth St, Brisbane City QLD 4000', street: 'Elizabeth St', locality: 'Brisbane City QLD 4000',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Elizabeth+St%2C+Brisbane+City+QLD+4000',
  mapEmbed: 'https://www.google.com/maps?q=Elizabeth+St,+Brisbane+City+QLD+4000&z=15&hl=en&output=embed',
  hours: [
    { days: 'Monday – Friday', time: '7:00 am – 5:00 pm' },
    { days: 'Saturday', time: 'Field crews by arrangement' },
    { days: 'Sunday & public holidays', time: 'Closed' },
  ],
  introduction: 'Land, engineering and mobile LiDAR surveying for South East Queensland.',
  history: 'Corvane started in 2003 as a two-surveyor practice above a Brisbane shopfront, setting out house slabs and subdivisions. Terrestrial laser scanning followed in 2012 and vehicle-mounted mobile mapping in 2019 — the same field discipline, with far more data behind every decision.',
  mobileMapping: 'A vehicle-mounted LiDAR system records millions of points a second and full 360° imagery while travelling with traffic. One drive becomes a measurable corridor: surfaces, kerbs, line marking, signs, poles and structures, ready for design, GIS or asset registers.',
  sectors: ['Roads & bridges', 'Rail & transit', 'Land development', 'Water & utilities', 'Buildings & precincts', 'Energy & resources'],
  toolchain: [
    { title: 'Mobile & static LiDAR', text: 'Vehicle, tripod and handheld capture' },
    { title: 'Point-cloud processing', text: 'Registration, classification, QA' },
    { title: 'Civil 3D · 12d Model', text: 'Surfaces, alignments and design models' },
    { title: 'GIS · IFC · BIM', text: 'Asset data your systems can open' },
  ],
} as const;

export const yearsOperating = () => new Date().getFullYear() - company.founded;

export const copy = {
  heroLead: 'From a single boundary peg to a fully scanned motorway corridor, we capture the ground truth your project is built on.',
  servicesLead: 'Six connected services, from first site visit to final as-built — delivered by the same team, on the same coordinate system.',
  explore: 'One procedural interchange, three ways to read it. Switch between surface colour, height and intensity, and drag to rotate.',
  compare: 'Every photograph hides a measurement. Point clouds turn what you see into coordinates you can design from.',
  aboutLead: 'We are surveyors first. The scanners, drones and software matter because they let a small, experienced team see more of a site and get the answer right the first time.',
  aboutPartner: 'Clients bring us in early, when an accurate base survey prevents redesign, and keep us on through construction, when fast set-out and honest conformance checks keep crews moving.',
  mappingBenefits: [
    { title: 'Faster capture', text: 'Kilometres of corridor recorded in a morning, with no need to walk live lanes.' },
    { title: 'Safer sites', text: 'Crews stay inside the vehicle, so there are fewer lane closures and traffic controllers.' },
    { title: 'One scan, many uses', text: 'Design surfaces, clearance checks and asset audits come from the same dataset.' },
  ],
  portfolioLead: 'Sample projects showing the range of work a firm like ours delivers across the region.',
  contactLead: 'Tell us where the site is and what you need to know. We’ll come back within one business day with an approach, a timeline and a fixed-fee proposal.',
} as const;

export type Service = { id: string; title: string; description: string; details: string[] };
export const services: Service[] = [
  { id: 'mapping', title: 'Mobile LiDAR & 3D scanning', description: 'Vehicle-mounted and terrestrial laser scanning for road, rail and urban corridors, buildings and plant rooms.', details: ['Mobile mapping at traffic speed', 'Terrestrial and handheld scanning', '360° panoramic imagery', 'Feature extraction and asset audits'] },
  { id: 'engineering', title: 'Construction set-out', description: 'Precise set-out and control for civil works, structures and buildings.', details: ['Control networks', 'Civil and structural set-out', 'Pile and column positions'] },
  { id: 'digital', title: 'BIM & digital twins', description: 'Scan-to-BIM models and reality capture that design teams can coordinate against.', details: ['Scan-to-BIM (Revit, IFC)', 'Clash and clearance checks', 'Digital twin handover'] },
  { id: 'conformance', title: 'As-built & monitoring', description: 'Conformance surveys and movement monitoring during and after construction.', details: ['As-constructed (ADAC) records', 'Deformation monitoring', 'Settlement and crack surveys'] },
  { id: 'control', title: 'Drone survey & volumes', description: 'Aerial mapping for stockpiles, earthworks progress and large greenfield sites.', details: ['Photogrammetry and aerial LiDAR', 'Stockpile and cut/fill volumes', 'Progress orthophotos'] },
  { id: 'land', title: 'Land & development', description: 'Boundary, detail and subdivision surveys from feasibility to title.', details: ['Contour and detail surveys', 'Boundary identification', 'Subdivision and lease plans'] },
];

export type Project = { name: string; type: string; context: string };
export const projects: Project[] = [
  { name: 'Riverside residential tower', type: 'Building set-out & monitoring', context: 'Grid control, column set-out and weekly core verticality checks across 32 levels.' },
  { name: 'Regional road realignment', type: 'Corridor survey', context: 'Mobile LiDAR capture of 18 km of existing road for the design and drainage teams.' },
  { name: 'Stormwater trunk upgrade', type: 'As-constructed survey', context: 'Invert levels, pipe grades and ADAC records for a new trunk main and outlets.' },
  { name: 'Airside pavement renewal', type: 'Level & conformance survey', context: 'Dense pavement levels for resurfacing design, captured during overnight shutdowns.' },
  { name: 'Business park subdivision', type: 'Land development', context: '' },
  { name: 'Rail level-crossing removal', type: 'Corridor scan', context: '' },
  { name: 'Heritage façade record', type: 'Terrestrial scan', context: '' },
  { name: 'Water treatment plant twin', type: 'Scan-to-BIM', context: '' },
  { name: 'Bridge deck monitoring', type: 'Deformation monitoring', context: '' },
  { name: 'Quarry stockpile audit', type: 'Drone volumes', context: '' },
];

export const workflow = [
  { title: 'Capture', text: 'Field crews, scanners and drones record the site on a controlled coordinate system.' },
  { title: 'Process', text: 'Scans are registered, cleaned and checked against independent control.' },
  { title: 'Extract', text: 'We model the surfaces, features and structures the project needs.' },
  { title: 'Deliver', text: 'Drawings, models and data in the formats your team already uses.' },
] as const;

export const person = {
  name: 'Liam Hartwell', role: 'Principal Surveyor · Director',
  bio: 'Liam has led Corvane’s field and digital teams for more than fifteen years, from major road upgrades to tight inner-city towers. He still spends part of most weeks on site.',
  highlights: ['Construction survey coordination', 'Mobile mapping and scan QA', 'Design review before set-out'],
} as const;

// Shown in the banner and footer so visitors always know what they are looking at.
export const concept = {
  author: 'Roman Starostin',
  linkedin: 'https://www.linkedin.com/in/roman-starostin-a4666s429/',
  note: 'Corvane Geospatial is a fictional company. This is a website concept built to demonstrate design and front-end development; the projects, people and testimonials are invented and the photography is stock.',
  // Vecteezy's free licence asks for this credit; it sits in the banner note rather than the footer.
  credit: 'Stock photos: Pixabay. Videos by Vecteezy.',
} as const;
