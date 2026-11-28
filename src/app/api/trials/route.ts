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
      lastUpdatePostDateStruct?: { date?: string }
      startDateStruct?: { date?: string }
    }
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string }
    }
    conditionsModule?: { conditions?: string[] }
    designModule?: {
      phases?: string[]
      enrollmentInfo?: { count?: number }
    }
  }
}

interface RawResponse {
  studies?: RawStudy[]
  totalCount?: number
  nextPageToken?: string
}

export interface Trial {
  nctId: string
  title: string
  status: string
  phases: string[]
  sponsor: string | null
  enrollment: number | null
  conditions: string[]
  lastUpdate: string | null
  startDate: string | null
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
  const requested = Number(request.nextUrl.searchParams.get('pageSize') ?? '20')
  const pageSize = Number.isFinite(requested) ? Math.min(50, Math.max(1, Math.floor(requested))) : 20
  // ClinicalTrials.gov page tokens are opaque. Reject anything that is not a
  // short URL-safe token so this route cannot be used as an open proxy.
  const pageToken = request.nextUrl.searchParams.get('pageToken') ?? ''
  const safeToken = /^[A-Za-z0-9._~-]{1,200}$/.test(pageToken) ? pageToken : ''

  const url = new URL('https://clinicaltrials.gov/api/v2/studies')
  url.searchParams.set('query.term', term)
  url.searchParams.set('pageSize', String(pageSize))
  url.searchParams.set('countTotal', 'true')
  if (safeToken) url.searchParams.set('pageToken', safeToken)

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
      conditions: p.conditionsModule?.conditions ?? [],
      lastUpdate: p.statusModule?.lastUpdatePostDateStruct?.date ?? null,
      startDate: p.statusModule?.startDateStruct?.date ?? null,
    }
  })

  return Response.json({
    trials,
    // A paged request reports totalCount as the page size. Keep the grand total
    // on the first page only.
    totalCount: safeToken ? null : (data.totalCount ?? trials.length),
    nextPageToken: data.nextPageToken ?? null,
  })
}
