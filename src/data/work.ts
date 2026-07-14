// Single source of truth for the 4 work/case-study records. WorkItem.astro
// (Task 10, homepage teaser + case-study page body) and the case-study pages
// themselves (Task 20) both key off this file.
//
// Copy is transcribed verbatim from the 4 source case-study pages in
// agl-reflections-website/work/*.html (see .superpowers/sdd/task-10-report.md
// for the exact section each field came from): `title` is the page's mirror
// <h1> text, `subtitle` is the page's `.lede` paragraph, `eventMeta` is the
// breadcrumb/eyebrow location line, `body` is the "The Story" section's
// paragraphs (concatenated, inline <b>/<i> markup preserved and rendered
// with set:html), `deployList` is each "What We Deployed" <li> (label bolded
// via <b>, also rendered with set:html), and `gallery` is every image in the
// page's "From the Night" .cs-gallery, in source order, with that section's
// (single, reused) alt text.
//
// FloydFest and the Mobile Stage Conference have no dedicated hero image in
// agl-reflections-website/assets/img — their case-study <header class="page-hero">
// reuses the first gallery photo as the background, so `heroImage` for those
// two records points at the same imported module as `gallery[0].image`.
//
// No source gallery image carries a unique per-photo caption (the alt text
// is identical across every image in a set), so `caption` is left unset
// throughout rather than inventing one; `wide` is likewise left unset since
// the source data gives no basis for singling out a photo as a wide tile.
import type { ImageMetadata } from 'astro';

import heroHialeah from '../assets/img/work-hialeah.webp';
import heroBigorange from '../assets/img/work-bigorange.webp';

import hialeah01 from '../assets/img/work-cs/hialeah-01.jpg';
import hialeah02 from '../assets/img/work-cs/hialeah-02.jpg';
import hialeah03 from '../assets/img/work-cs/hialeah-03.jpg';
import hialeah04 from '../assets/img/work-cs/hialeah-04.jpg';
import hialeah05 from '../assets/img/work-cs/hialeah-05.jpg';
import hialeah06 from '../assets/img/work-cs/hialeah-06.jpg';
import hialeah07 from '../assets/img/work-cs/hialeah-07.jpg';
import hialeah08 from '../assets/img/work-cs/hialeah-08.jpg';
import hialeah09 from '../assets/img/work-cs/hialeah-09.jpg';
import hialeah10 from '../assets/img/work-cs/hialeah-10.jpg';
import hialeah11 from '../assets/img/work-cs/hialeah-11.jpg';
import hialeah12 from '../assets/img/work-cs/hialeah-12.jpg';

import bigorange01 from '../assets/img/work-cs/bigorange-01.jpg';

import floydfest01 from '../assets/img/work-cs/floydfest-01.jpg';
import floydfest02 from '../assets/img/work-cs/floydfest-02.jpg';
import floydfest03 from '../assets/img/work-cs/floydfest-03.jpg';

import msc01 from '../assets/img/work-cs/msc-01.jpg';
import msc02 from '../assets/img/work-cs/msc-02.jpg';
import msc03 from '../assets/img/work-cs/msc-03.jpg';
import msc04 from '../assets/img/work-cs/msc-04.jpg';
import msc05 from '../assets/img/work-cs/msc-05.jpg';
import msc06 from '../assets/img/work-cs/msc-06.jpg';
import msc07 from '../assets/img/work-cs/msc-07.jpg';
import msc08 from '../assets/img/work-cs/msc-08.jpg';

export interface GalleryImage {
  image: ImageMetadata;
  alt: string;
  caption?: string;
  wide?: boolean;
}

export interface WorkCase {
  slug: string;
  title: string;
  subtitle: string;
  eventMeta: string;
  heroImage: ImageMetadata;
  heroImageAlt: string;
  body: string;
  deployList: string[];
  gallery: GalleryImage[];
}

export const WORK: WorkCase[] = [
  {
    slug: 'hialeah-4th-of-july',
    title: 'Hialeah 4th of July',
    subtitle:
      "The City of Hialeah's Independence Day celebration — thousands in the park, a headliner on deck, and one of the biggest fireworks shows in the state overhead. <b>Built on a Reflections stage.</b>",
    eventMeta: 'Milander Park · Every July 4',
    heroImage: heroHialeah,
    heroImageAlt: 'Fireworks bursting around the stage at the Hialeah 4th of July celebration',
    body: `<p>Every Fourth of July, Milander Park becomes one of South Florida's biggest single-night gatherings — live music, cultural pride, and a fireworks finale that draws crowds from across the county. In 2021, the night was headlined by Cuban reggaeton stars <b>Gente de Zona</b>, and the whole show stood on Reflections Productions steel.</p><p>Reflections delivered the full production: an APEX GEN3 hydraulic stage, intelligent lighting rigs, and concert audio engineered so every corner of the park heard a stadium-grade mix. From load-in to strike, coordination between the artists, city officials and vendors ran through one production office — ours.</p><p>It's the kind of civic event where there is no second take: the anthem, the headliner and the fireworks happen once, on time, in front of everyone. That's the job Reflections has been doing for fifty years.</p>`,
    deployList: [
      '<b>APEX GEN3 mobile stage</b> — hydraulic deployment, show-ready in hours',
      '<b>Concert audio</b> — JBL arrays, FOH &amp; monitor engineering',
      '<b>Intelligent lighting</b> — design, hang and live operation',
      '<b>Full crew</b> — riggers, techs, stagehands, load-in to strike',
      '<b>Production management</b> — artists, city officials and vendors, one office',
      '<b>Fireworks coordination</b> — stage and show timed to the finale',
    ],
    gallery: [
      { image: hialeah01, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah02, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah03, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah04, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah05, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah06, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah07, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah08, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah09, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah10, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah11, alt: 'Hialeah 4th of July — Reflections Productions on site' },
      { image: hialeah12, alt: 'Hialeah 4th of July — Reflections Productions on site' },
    ],
  },
  {
    slug: 'big-orange-nye',
    title: 'Big Orange NYE Miami',
    subtitle:
      "Miami's answer to the Times Square ball: a glowing, 35-foot, 2,000-pound LED Orange climbing 400 feet up the InterContinental at midnight — <b>with the party built on Reflections stages below.</b>",
    eventMeta: 'Bayfront Park · December 31',
    heroImage: heroBigorange,
    heroImageAlt: 'The Big Orange New Year’s Eve stage in Miami with LED video walls',
    body: `<p>Every December 31, downtown Miami pours into <b>Bayfront Park</b> on Biscayne Bay for the Big Orange — the citrus-themed midnight icon that ascends the side of the InterContinental Miami as the year turns. The most recent edition marked the tradition's <b>40th anniversary</b>, making it one of the longest-running public New Year's spectacles in Florida.</p><p>Beneath the ascent is a full night of live entertainment — and that's where Reflections works. Stages, LED video walls and event production carrying performances from early evening through the midnight fireworks over the bay.</p><p>A five-hour live show, a hard midnight cue watched by thousands in the park and cameras across the country. You don't improvise that — you produce it.</p>`,
    deployList: [
      '<b>Mobile staging</b> — APEX hydraulic stage at Bayfront Park',
      '<b>LED video walls</b> — live feeds and countdown graphics',
      '<b>Concert audio</b> — full-park coverage through midnight',
      '<b>Show production</b> — five hours of live acts to a hard midnight cue',
      '<b>40th anniversary edition</b> — Miami’s longest-running NYE spectacle',
    ],
    gallery: [
      { image: bigorange01, alt: 'Big Orange NYE — stage and LED walls at Bayfront Park' },
    ],
  },
  {
    slug: 'floydfest',
    title: 'FloydFest Virginia',
    subtitle:
      'Two APEX stages, one mountain festival — proof the fleet travels. <b>A GEN3 flagship and the 2424, side by side in the Blue Ridge.</b>',
    eventMeta: 'Blue Ridge Mountains, VA',
    heroImage: floydfest01,
    heroImageAlt: 'FloydFest dual-stage APEX deployment',
    body: `<p>FloydFest is a multi-day roots-music festival high in Virginia's Blue Ridge Mountains — a long way from Princeton, Florida, which is exactly the point. When the routing calls for it, the APEX fleet rolls interstate.</p><p>Reflections deployed a <b>dual-stage setup</b>: a GEN3 flagship carrying the main-stage production alongside the nimbler APEX 2424 — two hydraulic stages standing up on festival ground where conventional staging would take days to build.</p><p><i>This one's photo-led — the full write-up is coming as we dig deeper into the archive with the Reflections crew.</i></p>`,
    deployList: [
      '<b>APEX GEN3 flagship</b> — main stage production',
      '<b>APEX 2424</b> — second stage, festival grounds',
      '<b>Interstate logistics</b> — Florida to Virginia and back',
      '<b>Festival-grade rigging</b> — multi-day, all-weather build',
    ],
    gallery: [
      { image: floydfest01, alt: 'FloydFest dual-stage APEX deployment' },
      { image: floydfest02, alt: 'FloydFest dual-stage APEX deployment' },
      { image: floydfest03, alt: 'FloydFest dual-stage APEX deployment' },
    ],
  },
  {
    slug: 'mobile-stage-conference-2023',
    title: 'Innovation On Wheels',
    subtitle:
      "The industry's premier mobile-staging gathering — and the <b>APEX 5040 GEN3 turning heads at the product showcase.</b>",
    eventMeta: 'Las Vegas, NV · Feb 2023',
    heroImage: msc01,
    heroImageAlt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase',
    body: `<p>The Mobile Stage Conference brings together the top minds in live event production, concert staging and outdoor entertainment — manufacturers, rental companies and the crews who run them. In February 2023, that gathering happened in Las Vegas, and Reflections was on the floor.</p><p>The star of the product showcase was the <b>APEX 5040 GEN3</b> — the same 50-by-40 flagship in our fleet — drawing attention for its structural capacity and deployment speed. Between showcases, the program ran expert panels and safety forums shaping how the industry builds, inspects and operates mobile stages.</p><p>Being in that room matters: the standards discussed there are the standards our crews run on every South Florida show.</p>`,
    deployList: [
      '<b>APEX 5040 GEN3</b> — headline unit at the product showcase',
      '<b>Industry panels</b> — staging safety and operations forums',
      '<b>Peer network</b> — manufacturers and top rental operators',
      '<b>Standards home</b> — what we learn there runs on every show',
    ],
    gallery: [
      { image: msc01, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc02, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc03, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc04, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc05, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc06, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc07, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
      { image: msc08, alt: 'Mobile Stage Conference 2023 — APEX 5040 GEN3 showcase' },
    ],
  },
];
