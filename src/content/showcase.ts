// Presentation data for the concept: imagery, stats and sample content layered on company.ts.
import { company, services, yearsOperating } from './company';

export type Stat = { value: number; suffix?: string; label: string; plain?: boolean };
export const stats = (): Stat[] => [
  { value: yearsOperating(), suffix: '+', label: 'Years surveying South East Queensland' },
  { value: company.founded, label: 'Founded in Brisbane', plain: true },
  { value: services.length, label: 'Connected service areas' },
  { value: company.sectors.length, label: 'Sectors we work across' },
];

export type Media = { src: string; width: number; height: number; alt: string; position?: string; small?: string };

const stock = (name: string, width: number, height: number, alt: string, position?: string): Media =>
  ({ src: `/assets/stock/${name}-1600.webp`, small: `/assets/stock/${name}-800.webp`, width, height, alt, position });

// The featured mobile-mapping card uses a render of this site's own procedural scene.
export const serviceMedia: Record<string, Media> = {
  mapping: { src: '/assets/scene/oblique-rgb.webp', small: '/assets/scene/oblique-rgb-800.webp', width: 1500, height: 1000, alt: 'Point cloud of a road interchange with an overpass, buildings and trees', position: '50% 45%' },
  engineering: { src: '/assets/stock/leica-earthworks-1000.webp', width: 1000, height: 1512, alt: 'Total station on a tripod over levelled earthworks', position: '50% 30%' },
  digital: stock('site-foundations', 1600, 1066, 'Piled foundations on a city construction site with tower cranes', '50% 60%'),
  conformance: stock('crane-aerial', 1600, 1066, 'Aerial view of a building under construction beside a tower crane', '50% 55%'),
  control: stock('powie-drone', 1600, 1102, 'Survey drone with a gimbal camera in flight against a blue sky', '50% 50%'),
  land: stock('theodolite-street', 1600, 1200, 'Surveyor looking through a theodolite on a suburban street', '50% 40%'),
};

export type ProjectMedia = Media & { small: string };
export const projectMedia: ProjectMedia[] = [
  { ...stock('cranes-sky', 1600, 1066, 'Tower cranes above a building frame against a blue sky', '50% 40%'), small: '/assets/stock/cranes-sky-800.webp' },
  { ...stock('surveyor-dirt-road', 1600, 1200, 'Surveyor at a total station on an unsealed rural road', '60% 50%'), small: '/assets/stock/surveyor-dirt-road-800.webp' },
  { ...stock('level-in-pipe', 1600, 1066, 'Survey level framed by a large concrete pipe on a drainage site', '50% 50%'), small: '/assets/stock/level-in-pipe-800.webp' },
  { ...stock('total-station-sky', 1600, 1200, 'Total station against the sky with an aircraft passing', '50% 50%'), small: '/assets/stock/total-station-sky-800.webp' },
];

export const aboutVideo = { src: '/assets/stock/surveyor-hivis.mp4', poster: '/assets/stock/surveyor-hivis-poster.webp', label: 'Surveyor in high-visibility clothing operating a total station' };
export const mappingVideo = { src: '/assets/stock/surveyor-highway.mp4', poster: '/assets/stock/surveyor-highway-poster.webp', label: 'Surveyor working beside a newly sealed highway' };
export const personMedia = stock('main-surveyor', 1600, 1054, 'Portrait of a surveyor in a white hard hat', '62% 30%');
export const crewMedia = stock('crew-silhouette', 1600, 1060, 'Construction crew silhouetted on a deck at sunset', '50% 42%');
export const compareMedia: Media = { src: '/assets/stock/architecture-1600.webp', small: '/assets/stock/architecture-800.webp', width: 1600, height: 1066, alt: 'Curved elevated motorway on concrete piers above an empty interchange' };

export type Testimonial = { quote: string; name: string; role: string; company: string; sample: true };
// Sample content for the concept: fictitious people and companies only.
export const testimonials: Testimonial[] = [
  { quote: 'Set-out was there before our formwork crew, every pour. On a 32-level job, that reliability is worth more than any software feature.', name: 'Daniel R.', role: 'Project Engineer', company: 'Corbelle Civil Group', sample: true },
  { quote: 'They scanned eighteen kilometres of road in a morning and the design team had a clean surface within the week. No lane closures, no drama.', name: 'Priya S.', role: 'Design Manager', company: 'Tallowood Infrastructure', sample: true },
  { quote: 'What stands out is the judgement. Liam’s team flags design clashes before they become site problems and explains the data so everyone understands it.', name: 'Mark T.', role: 'Construction Manager', company: 'Mirrabrook Constructions', sample: true },
  { quote: 'Monthly drone volumes replaced a week of manual pickups. The numbers reconcile and the orthophotos settle arguments with subcontractors.', name: 'Hannah L.', role: 'Site Superintendent', company: 'Kestrel Earthworks', sample: true },
  { quote: 'Our ADAC submissions were accepted first time. Thorough, well organised and delivered when they said they would be.', name: 'James O.', role: 'Asset Delivery Lead', company: 'Anvara Water Services', sample: true },
];

export const initials = (name: string) => name.split(/\s+/).map(part => part[0]).join('').replace('.', '');

// Renders of this site's procedural scene (scripts/generate-gallery.ts).
const scene = (file: string, title: string, alt: string) => ({ src: `/assets/scene/${file}.webp`, small: `/assets/scene/${file}-800.webp`, width: 1500, height: 1000, title, alt });
export const galleryMedia: (Media & { title: string })[] = [
  scene('corridor-hero', 'Scanner station view', 'Point cloud of the interchange seen from the scanner position'),
  scene('overview-elevation', 'Overview · elevation', 'Interchange point cloud coloured by height'),
  scene('plan-intensity', 'Plan · intensity', 'Top-down point cloud of the interchange in greyscale intensity'),
  scene('overpass-elevation', 'Overpass · elevation', 'Low view along the overpass coloured by height'),
  scene('oblique-rgb', 'Oblique · surface colour', 'Interchange point cloud in surface colours'),
  scene('plan-elevation', 'Plan · elevation', 'Top-down point cloud of the interchange coloured by height'),
];
