import { ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { company, concept, copy, person, projects, services, workflow, yearsOperating } from '@/content/company';
import { aboutVideo, crewMedia, mappingVideo, personMedia, projectMedia, serviceMedia, stats } from '@/content/showcase';
import { SiteHeader } from '@/components/SiteHeader';
import { ScannerSimulationProvider, CaptureCounter } from '@/components/ScannerCounter';
import { SceneViewer } from '@/components/three/SceneViewer';
import { StockVideo } from '@/components/StockVideo';
import { Wordmark } from '@/components/Wordmark';
import { Reveal } from '@/components/Reveal';
import { Media } from '@/components/ui/Media';
import { CountUp } from '@/components/ui/CountUp';
import { BriefForm } from '@/components/ui/BriefForm';
import { serviceIcons, sectorIcons, workflowIcons } from '@/components/ui/icons';
import { Constellation, DotClouds, LaserBridge, LaserLine, PhotoToPoints, ScanStrip, TechHero, TestimonialCarousel } from './TechWidgets';

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`t-eyebrow ${light ? 'is-light' : ''}`}><span />{children}</p>;
}

function Head({ eyebrow, title, text, light = false, action }: { eyebrow: string; title: React.ReactNode; text?: string; light?: boolean; action?: React.ReactNode }) {
  return (
    <div className={`t-head ${light ? 'is-light' : ''}`}>
      <div><Eyebrow light={light}>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>
      {action}
    </div>
  );
}

function Figures() {
  return (
    <section className="t-figures t-dark">
      <div className="t-figures-grid">
        {stats().map(stat => <div key={stat.label}><strong><CountUp value={stat.value} suffix={stat.suffix} plain={stat.plain} /></strong><span>{stat.label}</span></div>)}
      </div>
      <div className="t-sector-line"><span>Sectors</span><ul>{company.sectors.map(sector => <li key={sector}>{sector}</li>)}</ul></div>
    </section>
  );
}

function Services() {
  const [featured, ...rest] = services;
  const FeaturedIcon = serviceIcons[featured.id];
  return (
    <section className="t-section t-light t-services" id="services">
      <DotClouds seed={3} />
      <Head eyebrow="Our services" title={<>Specialist <em>surveying.</em></>} text={copy.servicesLead} />
      <div className="t-bento">
        <Reveal as="article" className="t-card t-card-feature">
          <Media src={serviceMedia.mapping.src} srcSmall={serviceMedia.mapping.small} sizes="(max-width: 1100px) 100vw, 50vw" alt={serviceMedia.mapping.alt} width={serviceMedia.mapping.width} height={serviceMedia.mapping.height} ratio="auto" position={serviceMedia.mapping.position} />
          <div className="t-card-feature-body">
            <p className="t-tags"><span>Point cloud</span><span>360° imagery</span><span>BIM / GIS</span></p>
            <h3><FeaturedIcon size={28} />{featured.title}</h3>
            <p>{featured.description}</p>
            <ul>{featured.details.map(detail => <li key={detail}><Check size={16} />{detail}</li>)}</ul>
          </div>
        </Reveal>
        {rest.map((service, index) => {
          const Icon = serviceIcons[service.id], media = serviceMedia[service.id];
          return (
            <Reveal as="article" key={service.id} delay={(index % 2) * .08} className={`t-card ${index === rest.length - 1 ? 't-card-wide' : ''}`}>
              <div className="t-card-media">
                <Media src={media.src} srcSmall={media.small} sizes="(max-width: 767px) 100vw, 40vw" alt={media.alt} width={media.width} height={media.height} ratio="16 / 9" position={media.position} />
                <span className="t-card-no">0{index + 2}</span>
                <span className="t-card-icon"><Icon size={20} /></span>
                <span className="t-card-beam" aria-hidden="true" />
              </div>
              <div className="t-card-body">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="t-card-points">{service.details.join(' · ')}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section className="t-section t-dark t-explore" id="explore">
      <Head light eyebrow="Explore the data" title={<>Look <em>closer.</em></>} text={copy.explore} />
      <SceneViewer variant="technology" />
      <div className="t-explore-compare">
        <Head light eyebrow="Photo → point cloud" title={<>Same place. <em>Measurable.</em></>} text={copy.compare} />
        <PhotoToPoints />
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="t-section t-light t-about" id="about">
      <DotClouds seed={7} />
      <Reveal className="t-about-visual">
        <StockVideo loop src={aboutVideo.src} poster={aboutVideo.poster} label={aboutVideo.label} ratio="4 / 5" className="t-about-video" />
        <span className="t-visor t-visor-tl" aria-hidden="true" /><span className="t-visor t-visor-br" aria-hidden="true" />
        <div className="t-plate"><strong>{yearsOperating()}+</strong><span>Years surveying<br />South East Queensland</span></div>
      </Reveal>
      <div className="t-about-copy">
        <Eyebrow>About {company.short}</Eyebrow>
        <h2>Local knowledge.<br /><em>Forward outlook.</em></h2>
        <p>{copy.aboutLead}</p>
        <p>{company.history}</p>
        <ul className="t-kit">
          {company.toolchain.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.text}</span></li>)}
        </ul>
      </div>
    </section>
  );
}

function MobileMapping() {
  return (
    <section className="t-section t-dark t-mapping">
      <Head light eyebrow="Mobile mapping" title={<>Capture the corridor. <em>Not the traffic.</em></>} text={company.mobileMapping} />
      <div className="t-mapping-grid">
        <StockVideo className="t-mapping-video" src={mappingVideo.src} poster={mappingVideo.poster} label={mappingVideo.label} playLabel="Play the field video" />
        <ul className="t-mapping-facts">
          {copy.mappingBenefits.map((item, index) => { const Icon = [serviceIcons.mapping, serviceIcons.conformance, serviceIcons.digital][index]; return <li key={item.title}><span className="t-fact-icon"><Icon size={22} /></span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>; })}
        </ul>
      </div>
    </section>
  );
}

// The line runs from the first icon centre to the last, and the packet crosses it in the first
// 90% of the 4 s loop, so it reaches icon i at i / 3 × 3.6 s. Must match t-packet in technology.css.
const pipeDelays = [0, 1.2, 2.4, 3.6];

function Pipeline() {
  return (
    <section className="t-section t-light t-pipeline">
      <DotClouds seed={11} />
      <img className="t-instrument t-instrument-photo" src="/assets/stock/total-station-transparent.webp" alt="" width={1024} height={1536} loading="lazy" aria-hidden="true" />
      <Head eyebrow="From capture to context" title={<>Data is only <em>the beginning.</em></>} />
      <div className="t-pipe-wrap">
      <span className="t-pipe-line" aria-hidden="true"><span className="t-pipe-packet" /></span>
      <ol className="t-pipe">
        {workflow.map((step, index) => {
          const Icon = workflowIcons[index];
          return (
            <Reveal as="li" key={step.title} delay={index * .1} className="t-pipe-node" >
              <span className="t-pipe-icon" style={{ animationDelay: `${pipeDelays[index]}s` }}><Icon size={24} /></span>
              <span className="t-pipe-no">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          );
        })}
      </ol>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section className="t-section t-dark t-portfolio" id="projects">
      <Head light eyebrow="Sample portfolio" title={<>Recent project <em>experience.</em></>} text={copy.portfolioLead} action={<a className="t-text-link" href="#contact">Discuss a project<ArrowRight size={18} /></a>} />
      <div className="t-projects">
        {projects.slice(0, 4).map((project, index) => {
          const media = projectMedia[index];
          return (
            <Reveal as="article" key={project.name} delay={(index % 2) * .08} className={`t-project t-project-${index + 1}`}>
              <Media src={media.src} srcSmall={media.small} alt={media.alt} width={media.width} height={media.height} ratio="auto" position={media.position} />
              <span className="t-project-scan" aria-hidden="true" />
              <div className="t-project-body">
                <p>{project.type}</p>
                <h3>{project.name}</h3>
                <span>{project.context}</span>
              </div>
            </Reveal>
          );
        })}
      </div>
      <ul className="t-terminal" aria-label="Further sample projects">
        {projects.slice(4).map((project, index) => <li key={project.name}><span>{String(index + 5).padStart(2, '0')}</span><strong>{project.name}</strong><em>{project.type}</em></li>)}
      </ul>
    </section>
  );
}

function People() {
  return (
    <section className="t-section t-light t-people">
      <DotClouds seed={5} />
      <div className="t-person">
        <div className="t-person-photo"><Media src={personMedia.src} srcSmall={personMedia.small} sizes="(max-width: 767px) 100vw, 30vw" alt={personMedia.alt} width={personMedia.width} height={personMedia.height} ratio="1 / 1" position={personMedia.position} /><span className="t-visor t-visor-tl" aria-hidden="true" /><span className="t-visor t-visor-br" aria-hidden="true" /></div>
        <div>
          <Eyebrow>Our people</Eyebrow>
          <h2>{person.name.split(' ')[0]} <em>{person.name.split(' ')[1]}</em></h2>
          <p className="t-person-role">{person.role}</p>
          <p>{person.bio}</p>
          <p>{copy.aboutPartner}</p>
          <ul className="t-person-points">{person.highlights.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a className="t-text-link is-dark" href="#contact">Talk to the team<ArrowRight size={18} /></a>
        </div>
      </div>
      <div className="t-sectors-panel">
        <p>Sectors we work in</p>
        <ul>{company.sectors.map((sector, index) => { const Icon = sectorIcons[index]; return <li key={sector}><Icon size={22} />{sector}</li>; })}</ul>
      </div>
      <figure className="t-crew">
        <Media src={crewMedia.src} srcSmall={crewMedia.small} sizes="100vw" alt={crewMedia.alt} width={crewMedia.width} height={crewMedia.height} ratio="auto" position={crewMedia.position} />
        <figcaption><span className="t-mono">Field crews · South East Queensland</span><strong>On site before the first peg goes in.</strong></figcaption>
      </figure>
    </section>
  );
}

function Contact() {
  return (
    <section className="t-section t-light t-contact" id="contact">
      <DotClouds seed={13} />
      {/* <LaserScanner className="t-instrument t-instrument-scanner" strokeWidth={1.2} /> */}
      <div className="t-contact-intro">
        <Eyebrow>Start a scan brief</Eyebrow>
        <h2>Your next project.<br /><em>Measured.</em></h2>
        <p>{copy.contactLead}</p>
        <address className="t-contact-cards">
          <a href={`tel:${company.tel}`}><span><Phone size={22} /></span><small>Phone</small><strong>{company.phone}</strong></a>
          <a href={`mailto:${company.email}`}><span><Mail size={22} /></span><small>Email</small><strong>{company.email}</strong></a>
          <a href={company.mapUrl} target="_blank" rel="noopener noreferrer"><span><MapPin size={22} /></span><small>Office</small><strong>{company.address}</strong></a>
          <p><span><Clock size={22} /></span><small>Office hours</small><strong>{company.hours[0].days}, {company.hours[0].time}</strong></p>
        </address>
      </div>
      <div className="t-brief-wrap">
        <span className="t-visor t-visor-tl" aria-hidden="true" /><span className="t-visor t-visor-br" aria-hidden="true" />
        <BriefForm className="t-brief" submitLabel="Send scan brief" />
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="t-footer">
      <div className="t-footer-grid">
        <div className="t-footer-brand">
          <Wordmark />
          <p className="t-mono">Spatial / engineering · Brisbane</p>
          <p>Land, engineering and mobile LiDAR surveying for South East Queensland since {company.founded}.</p>
        </div>
        <div><p>Services</p><ul>{services.slice(0, 5).map(service => <li key={service.id}><a href="#services">{service.title}</a></li>)}</ul></div>
        <div>
          <p>Office hours</p>
          <dl className="t-hours">{company.hours.map(item => <div key={item.days}><dt>{item.days}</dt><dd>{item.time}</dd></div>)}</dl>
          <p className="t-hours-note">Brisbane time (AEST)</p>
        </div>
        <div><p>Contact</p><ul><li><a href={`tel:${company.tel}`}>{company.phone}</a></li><li><a href={`mailto:${company.email}`}>{company.email}</a></li><li><a href={company.mapUrl} target="_blank" rel="noopener noreferrer">{company.street}<br />{company.locality}</a></li></ul></div>
      </div>
      <div className="t-map">
        <iframe title={`Map: ${company.address}`} src={company.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <a className="t-map-open" href={company.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} />Open in Google Maps<ArrowUpRight size={16} /></a>
      </div>
      <div className="t-footer-legal">
        <p><strong>© {year} {concept.author}.</strong> {concept.note}</p>
      </div>
    </footer>
  );
}

export function TechnologySite() {
  return (
    <ScannerSimulationProvider>
      <Constellation />
      <LaserLine />
      <SiteHeader
        design="technology"
        topBar={<><span><a href={`tel:${company.tel}`}><Phone size={15} />{company.phone}</a><a href={`mailto:${company.email}`}><Mail size={15} />{company.email}</a></span><span><Clock size={15} />Mon–Fri 7 am – 5 pm · Brisbane</span></>}
        links={[{ label: 'Services', href: '#services' }, { label: 'Explore', href: '#explore' }, { label: 'Portfolio', href: '#projects' }, { label: 'About', href: '#about' }]}
        cta={{ label: 'Start a scan brief', href: '#contact' }}
      />
      <main id="main-content">
        <TechHero />
        <LaserBridge index="01 / 08" />
        <Figures />
        <section className="t-capture t-dark" aria-label="Capture simulation"><CaptureCounter variant="band" /></section>
        <Services />
        <Explore />
        <About />
        <MobileMapping />
        <Pipeline />
        <Portfolio />
        <section className="t-section t-dark t-testimonials"><TestimonialCarousel /></section>
        <People />
        <section className="t-section t-dark t-gallery">
          <Head light eyebrow="Procedural scene · six stations" title={<>The detail <em>tells the story.</em></>} text="Stills rendered from the same code-generated point cloud as the viewer above." />
          <ScanStrip />
        </section>
        <Contact />
      </main>
      <Footer />
    </ScannerSimulationProvider>
  );
}
