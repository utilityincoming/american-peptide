import { NextRequest } from 'next/server'

interface RawStudy {
  protocolSection?: {
    identificationModule?: {
      nctId?: string
      briefTitle?: string
      officialTitle?: string
    }
    statusModule?: {
      overallStatus?: string
    }
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string }
    }
    designModule?: {
      phases?: string[]
      enrollmentInfo?: { count?: number }
    }
  }
}

interface RawResponse {
  studies?: RawStudy[]
  totalCount?: number
}

export interface Trial {
  nctId: string
  title: string
  status: string
  phases: string[]
  sponsor: string | null
  enrollment: number | null
}

const PHASE_LABEL: Record<string, string> = {
  EARLY_PHASE1: 'Early Phase 1',
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  PHASE3: 'Phase 3',
  PHASE4: 'Phase 4',
  NA: 'N/A',
}

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get('query')?.trim() || 'peptide therapeutics'

  const url = new URL('https://clinicaltrials.gov/api/v2/studies')
  url.searchParams.set('query.term', term)
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('countTotal', 'true')

  const upstream = await fetch(url.toString(), { headers: { accept: 'application/json' } })

  if (!upstream.ok) {
    const text = await upstream.text()
    return Response.json(
      { error: `ClinicalTrials.gov error (${upstream.status}): ${text.slice(0, 300)}` },
      { status: upstream.status },
    )
  }

  const data: RawResponse = await upstream.json()

  const trials: Trial[] = (data.studies ?? []).map((s) => {
    const p = s.protocolSection ?? {}
    const id = p.identificationModule ?? {}
    const status = p.statusModule?.overallStatus ?? 'UNKNOWN'
    const phases = (p.designModule?.phases ?? []).map((ph) => PHASE_LABEL[ph] ?? ph)
    return {
      nctId: id.nctId ?? '',
      title: id.briefTitle ?? id.officialTitle ?? 'Untitled study',
      status,
      phases,
      sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? null,
      enrollment: p.designModule?.enrollmentInfo?.count ?? null,
    }
  })

  return Response.json({
    trials,
    totalCount: data.totalCount ?? trials.length,
  })
}
