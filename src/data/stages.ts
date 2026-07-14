// Single source of truth for the APEX stage fleet. Both FleetCard/CompareTable
// (Task 8) and the stage detail pages (Task 19) import from this file.
//
// Data provenance (see .superpowers/sdd/task-8-report.md for exact source
// line ranges): the 5040/4240/3224/4232 records use the fleet-grid markup
// verbatim from agl-reflections-website/index.html lines 294-356. The
// 2016/2420/2424/vip-deck-3724 records transcribe deck size, trim height and
// trailer weight from each stage's own dedicated page
// (agl-reflections-website/stages/<slug>.html), with `specs` bullets sourced
// from the second fleet-grid on agl-reflections-website/stages/index.html
// (lines 114-205), since those four don't appear in the homepage grid.
//
// `image` holds an imported ImageMetadata object (not a bare string) because
// Astro's <Image> component needs the processed module reference to optimize
// local assets — a raw path string only works for remote images.
import type { ImageMetadata } from 'astro';

import fleet5040 from '../assets/img/fleet-5040.webp';
import fleet4240 from '../assets/img/fleet-4240.webp';
import fleet3224 from '../assets/img/fleet-3224.webp';
import fleet4232 from '../assets/img/fleet-4232.webp';
import fleet2424 from '../assets/img/fleet-2424.webp';
import fleet2420 from '../assets/img/fleet-2420.webp';
import fleet2016 from '../assets/img/fleet-2016.webp';
import fleetVip3724 from '../assets/img/fleet-vip-3724.webp';

export interface Stage {
  slug: string; // e.g. "apex-5040"
  model: string; // "5040"
  series: string; // "APEX · Classic & GEN3"
  deck: string; // "50′ × 40′ DECK"
  image: ImageMetadata; // imported from src/assets/img
  imageAlt: string;
  specs: string[]; // bullet list, feature card only
  chip?: string; // "Flagship" / "Legacy & GEN3" / "2026 Season"
  featured?: boolean; // grid-column:span 7
  coFeatured?: boolean; // grid-column:span 5
  soon?: boolean; // dashed "coming soon" treatment
  trimHeight?: string; // for CompareTable, e.g. "13′3″"
  trailerWeight?: string; // e.g. "55,165 lb"
}

export const STAGES: Stage[] = [
  {
    // Source: agl-reflections-website/index.html lines 294-309
    slug: 'apex-5040',
    model: '5040',
    series: 'APEX · Classic & GEN3',
    deck: '50′ × 40′ DECK',
    image: fleet5040,
    imageAlt: 'APEX 5040 GEN3 stage fully built with line arrays and video wall',
    specs: [
      'Largest stage in the fleet — headliner-scale rigging',
      'Travels at 13′3″ tall × 102″ wide · 55,165 lb trailer',
      '3.0 GPM hydraulic lift system',
    ],
    chip: 'Flagship',
    featured: true,
    trimHeight: '35′4″ floor-to-truss (max)',
    trailerWeight: '55,165 lb',
  },
  {
    // Source: agl-reflections-website/index.html lines 311-325
    slug: 'apex-4240',
    model: '4240',
    series: 'APEX',
    deck: '42′ × 40′ AREA',
    image: fleet4240,
    imageAlt: 'APEX 4240 stage at an oceanfront concert series',
    specs: [
      '42′ × 40′ performance area, hydraulic lift',
      'High rigging capacity for full production rigs',
    ],
    chip: 'Legacy & GEN3',
    coFeatured: true,
    // Trim height / trailer weight: not published — apex-4240.html spec
    // table says "Full dimensional & weight data: Spec sheet on request".
  },
  {
    // Source: agl-reflections-website/index.html lines 327-341
    slug: 'apex-3224',
    model: '3224',
    series: 'APEX',
    deck: '32′ × 24′ DECK',
    image: fleet3224,
    imageAlt: 'APEX 3224 stage lit at an evening event',
    specs: [
      'Hydraulic lift · ~16′ trim height · reversible front',
      '34′ trailer, gooseneck — ball or kingpin',
    ],
    trimHeight: '~16′',
    // Trailer weight not published — apex-3224.html spec table lists
    // "Rigging & load data: Spec sheet on request" (only trailer length, 34′, is given).
  },
  {
    // Source: agl-reflections-website/index.html lines 343-356
    slug: 'apex-4232',
    model: '4232',
    series: 'APEX · Next in line',
    deck: 'Coming 2026', // stages/index.html compare table deckno cell, line 105
    image: fleet4232,
    imageAlt: 'Rendering of the upcoming APEX 4232 mobile stage',
    specs: [
      'The newest APEX — announced for the 2026 season',
      'Reserve dates now for early bookings',
    ],
    chip: '2026 Season',
    soon: true,
    // No specs published yet for this stage.
  },
  {
    // Source: agl-reflections-website/stages/apex-2424.html lines 84-116;
    // specs bullets from stages/index.html lines 148-158.
    slug: 'apex-2424',
    model: '2424',
    series: 'APEX',
    deck: '24′ × 24′ DECK',
    image: fleet2424,
    imageAlt: 'APEX 2424 stage beside a GEN3 stage on the festival lawn at FloydFest',
    specs: [
      'Stage deck: 24′ × 24′',
      'Deployment: Self-contained hydraulic — under an hour',
    ],
    // Trim height / trailer weight not published — apex-2424.html spec
    // table lists "Dimensional & load data: Spec sheet on request", and the
    // stages/index.html compare table lists this stage's Height column as
    // "Spec sheet on request".
  },
  {
    // Source: agl-reflections-website/stages/apex-2420.html lines 84-116;
    // specs bullets from stages/index.html lines 159-169.
    slug: 'apex-2420',
    model: '2420',
    series: 'APEX',
    deck: '24′ × 20′ DECK',
    image: fleet2420,
    imageAlt: 'APEX 2420 stage lit blue at a New Times showcase event',
    specs: [
      'Stage deck: 24′ × 20′',
      'Stage height: 13′',
    ],
    trimHeight: '13′',
    // Trailer weight not published — apex-2420.html spec table lists
    // "Full dimensional data: Spec sheet on request" (flybay/cargo capacity given, not trailer weight).
  },
  {
    // Source: agl-reflections-website/stages/apex-2016.html lines 84-118;
    // specs bullets from stages/index.html lines 170-180.
    slug: 'apex-2016',
    model: '2016',
    series: 'APEX',
    deck: '20′ × 16′ DECK',
    image: fleet2016,
    imageAlt: 'APEX 2016 stage dressed for the Formula E Fan Village with LED screen',
    specs: [
      'Stage deck: 20′ × 16′',
      'Stage height: 12′10″',
    ],
    trimHeight: '12′10″',
    // Trailer weight not published — apex-2016.html spec table has no
    // trailer/weight row at all (flybay 800 lb each, roof 3,400 lb total).
  },
  {
    // Source: agl-reflections-website/stages/vip-deck-3724.html lines 84-118;
    // specs bullets from stages/index.html lines 181-191.
    slug: 'vip-deck-3724',
    model: '3724',
    series: "Captain's VIP Deck",
    deck: '45′ × 24′ DECK',
    image: fleetVip3724,
    imageAlt: "Captain's VIP Deck 3724 two-level mobile viewing deck with guardrails and stairs",
    specs: [
      'Deployed footprint: 45′ × 24′ (~888 sq ft)',
      'Transport dimensions: 35′ L × 102″ W × 10′6″ H',
    ],
    chip: 'VIP Hospitality',
    // This is a viewing platform, not a rigged stage, so it has no "trim
    // height" in the APEX sense — the compare table's Height column for
    // this row reads "Two-level platform" in the source.
    trimHeight: 'Two-level platform',
    // The spec table's "Trailer GVWR" (14,000 lb) is the closest published
    // figure to trailerWeight; it is a gross-weight rating, not the "total
    // trailer weight" figure published for the 5040, so it's labeled here.
    trailerWeight: '14,000 lb GVWR',
  },
];
