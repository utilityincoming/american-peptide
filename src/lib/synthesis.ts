// Synthesis hub content for AmericanPeptide.com
//
// Educational, research-use-only explainer of how a pure research peptide is
// actually manufactured — the full pipeline, what the equipment and operations
// cost, and what it takes to hold purity across global distribution.
//
// Editorial stance: pro-American. We are honest that intermediates are often
// imported and finished domestically, but the message is to DEMAND genuine,
// full-stack American synthesis and documentation — not to flatter offshore
// manufacturing. No JSX here; icons are mapped by slug in the page.

export interface SynthesisStage {
  /** 1-indexed position in the pipeline. */
  num: number
  /** Anchor id + icon key. */
  slug: string
  /** Lucide icon name, resolved to a component in the page. */
  icon: string
  title: string
  /** One-line description for the pipeline rail + card header. */
  summary: string
  /** Longer-form explainer paragraphs rendered in the stage card. */
  detail: string[]
  /** What this step costs — capital and/or per-batch. */
  cost?: string
  /** Where integrity/purity is won or lost at this step. */
  risk?: string
  /** The standard a researcher should expect from genuine US work. */
  americanStandard?: string
}

export const STAGES: SynthesisStage[] = [
  {
    num: 1,
    slug: 'design',
    icon: 'PencilRuler',
    title: 'Sequence design & specification',
    summary: 'The target sequence, salt form, and purity spec are defined before a single bond is made.',
    detail: [
      'Every peptide begins as a specification: the amino-acid sequence, any modifications (cyclization, acetylation, amidation, non-natural residues), the intended counterion/salt form, and the release criteria the finished material must meet.',
      'The spec is the contract. A reputable operation writes down its target purity, identity, and content thresholds up front — and tests against them at the end. Vendors who can\'t tell you the spec never had one.',
    ],
    cost: 'Mostly expertise: trained peptide chemists who can anticipate difficult couplings, aggregation-prone sequences, and side reactions before they cost a batch.',
    americanStandard: 'A written specification and release criteria you can request — not a vibe.',
  },
  {
    num: 2,
    slug: 'spps',
    icon: 'Cpu',
    title: 'Solid-phase peptide synthesis (SPPS)',
    summary: 'An automated synthesizer builds the chain one protected residue at a time on resin.',
    detail: [
      'Modern peptides are assembled by solid-phase synthesis: the growing chain stays anchored to an insoluble resin while protected amino acids are coupled on, one cycle at a time (Fmoc chemistry is the workhorse). Each residue means a deprotection step, a coupling step, and washes — dozens of cycles for a typical sequence.',
      'This is where the headline equipment lives. An automated peptide synthesizer coordinates reagent delivery, mixing, and timing across every cycle. Yield compounds across steps: a long sequence with even small per-cycle losses ends in a complex crude that purification then has to rescue.',
    ],
    cost: 'A research-scale automated synthesizer runs from the tens of thousands of dollars; multi-channel and production-scale instruments reach well into six figures. On top of capital, every run burns protected amino acids, coupling reagents, and resin — costs that scale with sequence length.',
    risk: 'Incomplete couplings and side reactions seed deletion and truncation impurities here. What you fail to build correctly, you pay to remove later.',
    americanStandard: 'Synthesis performed in-house on owned, maintained instruments — not a black-box crude bought sight-unseen.',
  },
  {
    num: 3,
    slug: 'cleavage',
    icon: 'Scissors',
    title: 'Cleavage & global deprotection',
    summary: 'The finished chain is cleaved from the resin and stripped of its protecting groups.',
    detail: [
      'Once the chain is complete, a cleavage cocktail (typically TFA-based with scavengers) releases the peptide from the resin and removes the side-chain protecting groups in one step. The peptide is then precipitated, usually in cold ether, and collected as a crude solid.',
      'Handling matters: scavenger choice, time, and temperature all influence how many side products form. Done carelessly, this step adds impurities that, again, purification must later clean up.',
    ],
    cost: 'Reagent and solvent volumes plus the fume-hood / solvent-handling infrastructure to run them safely.',
    risk: 'Over- or under-cleavage and oxidation-prone residues can degrade the crude before purification even starts.',
  },
  {
    num: 4,
    slug: 'purification',
    icon: 'Filter',
    title: 'Preparative HPLC purification',
    summary: 'The crude is separated on preparative chromatography to isolate the target peptide.',
    detail: [
      'This is the heart of quality. The crude mixture — target peptide plus deletions, truncations, and side products — is loaded onto preparative reversed-phase HPLC and separated by a solvent gradient. Fractions are collected, checked, and pooled to hit the purity spec.',
      'Purification is the step most often shortchanged. Pushing more material through a column faster, or stopping at a looser cut, raises yield and lowers cost — at the direct expense of purity. The difference between a 95%+ peptide and a barely-passable one is usually decided right here.',
    ],
    cost: 'Typically the single largest per-batch cost. A preparative HPLC system, large columns, and the volume of high-grade acetonitrile consumed per run add up fast; solvent-recovery infrastructure is its own capital line.',
    risk: 'A loose cut or overloaded column is how impure material reaches a vial while still looking finished.',
    americanStandard: 'A real purity number on a real chromatogram — ask to see the trace, not just a percentage.',
  },
  {
    num: 5,
    slug: 'counterion',
    icon: 'Replace',
    title: 'Counterion exchange & salt form',
    summary: 'The peptide is converted from its TFA salt to a research-appropriate counterion.',
    detail: [
      'Coming off TFA-based purification, peptides carry a trifluoroacetate counterion. Many workflows exchange this for acetate (or another defined salt) because residual TFA can interfere with downstream research use.',
      'The salt form is part of the identity of the material and affects the actual peptide content per milligram of powder — two reasons it belongs on the certificate of analysis.',
    ],
    cost: 'Additional processing time, reagents, and a re-lyophilization cycle.',
    risk: 'Skipped or undocumented salt exchange leaves residual TFA and an overstated peptide content.',
  },
  {
    num: 6,
    slug: 'lyophilization',
    icon: 'Snowflake',
    title: 'Lyophilization (freeze-drying)',
    summary: 'The purified peptide is freeze-dried into a stable solid — where appearance is born.',
    detail: [
      'The purified, salt-corrected peptide solution is frozen and dried under vacuum, leaving a solid that\'s far more stable for storage and shipping than a solution would be.',
      'This is where appearance comes from — and where the most common consumer mistake lives. The look of the cake (fluffy, dense, glassy, or flat) is driven by the freeze-drying parameters and any bulking agents present, not by how pure the peptide is. A pretty, voluminous cake can simply mean more bulking material. You cannot eyeball purity. Read the certificate.',
    ],
    cost: 'A shelf lyophilizer ranges from tens of thousands of dollars to six figures at controlled-environment / GMP scale, plus the energy and cycle time of each run.',
    risk: 'Poor cycles can collapse the cake or leave excess residual moisture, shortening shelf life regardless of purity.',
    americanStandard: 'Judge the certificate of analysis, not the cosmetics of the cake.',
  },
  {
    num: 7,
    slug: 'fill-finish',
    icon: 'TestTubes',
    title: 'Fill, finish & vialing',
    summary: 'Material is dispensed into vials, sealed, and labeled in a controlled environment.',
    detail: [
      'Bulk material is accurately dispensed into individual vials, stoppered, sealed, and labeled. Done properly, this happens in a controlled, low-particulate environment to protect the product from contamination.',
      'Here\'s the honest part of the supply chain: fill-and-finish is frequently the only step performed domestically when a crude or bulk peptide was made elsewhere. It is real work — but finishing an imported intermediate is not the same as making the peptide. Knowing the difference is how you read a provenance claim correctly.',
    ],
    cost: 'Cleanroom / controlled-environment build-out and upkeep, fill equipment, and the labor and documentation behind each batch.',
    americanStandard: 'Made in America should mean the peptide was synthesized here — not merely vialed here.',
  },
  {
    num: 8,
    slug: 'qc',
    icon: 'FileCheck2',
    title: 'QC & certificate of analysis',
    summary: 'The batch is tested for identity, purity, content, and safety before release.',
    detail: [
      'A genuine certificate of analysis is the proof that everything above was done right. It typically reports identity by mass spectrometry, purity by analytical HPLC (with the chromatogram), water content (Karl Fischer), counterion/peptide content, and — for sensitive work — endotoxin testing.',
      'Each of these is a separate instrument and a trained analyst. A COA is not marketing; it is the document that lets you trust a powder you cannot see into.',
    ],
    cost: 'An analytical suite — HPLC, LC-MS, Karl Fischer titrator, endotoxin (LAL) testing — each an instrument plus a qualified analyst and the time to run and document every batch.',
    risk: 'No COA, a generic COA reused across batches, or a percentage with no chromatogram are the clearest red flags in the market.',
    americanStandard: 'A batch-specific COA with the actual data — identity, purity trace, content, and water — available on request.',
  },
  {
    num: 9,
    slug: 'cold-chain',
    icon: 'Truck',
    title: 'Storage, cold chain & distribution',
    summary: 'Purity earned in the lab is kept — or lost — across handling and shipping.',
    detail: [
      'A peptide\'s journey doesn\'t end at the vial. Lyophilized material is comparatively stable, but heat, light, and moisture still degrade it over time; once reconstituted, stability is far shorter and refrigeration matters.',
      'Every hand-off is a chance to lose what purification won. Long, unrefrigerated transit — exactly what an imported intermediate absorbs before it\'s ever finished — spends part of the material\'s stability budget before it reaches the bench. A short, documented, domestic chain of custody is one of the quiet advantages of genuinely American manufacturing.',
    ],
    cost: 'Cold-storage capacity, validated cold-chain shipping (insulation and coolant), and the inventory discipline to rotate stock before it ages.',
    risk: 'Temperature excursions and stale inventory quietly erode purity after release — invisible on the label.',
    americanStandard: 'A short, cold, accountable supply chain — fewer hand-offs between synthesis and your bench.',
  },
]

export interface CostItem {
  icon: string
  label: string
  note: string
}

/** "What it actually costs" — the capital + operating wall behind real synthesis. */
export const ECONOMICS: CostItem[] = [
  {
    icon: 'Cpu',
    label: 'Automated synthesizer',
    note: 'Tens of thousands of dollars for a research-scale instrument; six figures for multi-channel or production scale.',
  },
  {
    icon: 'FlaskConical',
    label: 'Reagents & resin',
    note: 'Protected amino acids, coupling reagents, and resin burned every run — cost scales with sequence length.',
  },
  {
    icon: 'Filter',
    label: 'Preparative HPLC',
    note: 'A prep system, large columns, and high volumes of acetonitrile per batch — usually the biggest single cost.',
  },
  {
    icon: 'Snowflake',
    label: 'Lyophilizer',
    note: 'Shelf freeze-dryers from tens of thousands into six figures at controlled-environment scale.',
  },
  {
    icon: 'ShieldCheck',
    label: 'Controlled environment',
    note: 'Cleanroom build-out and maintenance for cleavage, fill, and finish is a major fixed cost.',
  },
  {
    icon: 'FileCheck2',
    label: 'Analytical QC suite',
    note: 'HPLC, LC-MS, Karl Fischer, and endotoxin testing — each an instrument plus a trained analyst.',
  },
  {
    icon: 'Users',
    label: 'Skilled labor & records',
    note: 'Chemists and QC analysts, plus the batch documentation that makes a COA mean something.',
  },
]

export interface ColdChainItem {
  icon: string
  label: string
  note: string
}

/** "The cold chain" — holding integrity and purity across handling + distribution. */
export const COLD_CHAIN: ColdChainItem[] = [
  {
    icon: 'Snowflake',
    label: 'Lyophilized stability',
    note: 'Freeze-dried powder is the durable form, but heat, light, and moisture still degrade it over months.',
  },
  {
    icon: 'Droplets',
    label: 'Reconstituted stability',
    note: 'Once in solution, the clock speeds up — refrigeration and short timelines matter.',
  },
  {
    icon: 'Thermometer',
    label: 'Temperature excursions',
    note: 'Long unrefrigerated transit spends stability budget before the vial ever reaches a bench.',
  },
  {
    icon: 'Truck',
    label: 'Chain of custody',
    note: 'Every hand-off is a chance to lose purity. Fewer, shorter, domestic hops protect the material.',
  },
]

/**
 * Compact plain-text digest of the synthesis pipeline for grounding the
 * research agent. Built from the same STAGES / ECONOMICS / COLD_CHAIN data the
 * /synthesis page renders, so the agent's knowledge and the page never drift
 * apart — edit the data above and both update together.
 */
export function synthesisDigest(): string {
  const stages = STAGES.map((s) => {
    const lines = [`${s.num}. ${s.title} — ${s.summary}`]
    s.detail.forEach((d) => lines.push(`   ${d}`))
    if (s.cost) lines.push(`   Cost: ${s.cost}`)
    if (s.risk) lines.push(`   Where purity is won or lost: ${s.risk}`)
    if (s.americanStandard) lines.push(`   American standard: ${s.americanStandard}`)
    return lines.join('\n')
  }).join('\n\n')

  const economics = ECONOMICS.map((e) => `- ${e.label}: ${e.note}`).join('\n')
  const coldChain = COLD_CHAIN.map((c) => `- ${c.label}: ${c.note}`).join('\n')

  return [
    'THE PEPTIDE SYNTHESIS PIPELINE — the authoritative, end-to-end account of how a pure research peptide is actually made (the full visual walkthrough lives at /synthesis):',
    stages,
    'WHAT REAL SYNTHESIS COSTS — the capital and operating wall behind genuine work:',
    economics,
    'HOLDING PURITY ACROSS THE COLD CHAIN — purity earned in the lab is kept or lost in handling and shipping:',
    coldChain,
  ].join('\n\n')
}
