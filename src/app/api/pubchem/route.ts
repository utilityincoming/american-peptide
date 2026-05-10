import { NextRequest } from 'next/server'

interface PubChemProp {
  urn: { label: string; name?: string }
  value: { sval?: string; fval?: number; ival?: number }
}

interface PubChemCompound {
  id: { id: { cid: number } }
  props?: PubChemProp[]
}

interface PubChemResponse {
  PC_Compounds?: PubChemCompound[]
  Fault?: { Code: string; Message: string }
}

export interface CompoundResult {
  cid: number
  name: string
  molecularFormula: string | null
  molecularWeight: string | null
}

function findProp(props: PubChemProp[] | undefined, label: string, name?: string) {
  if (!props) return null
  const match = props.find(
    (p) => p.urn.label === label && (name === undefined || p.urn.name === name),
  )
  if (!match) return null
  return match.value.sval ?? match.value.fval?.toString() ?? match.value.ival?.toString() ?? null
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim()

  if (!name) {
    return Response.json({ error: 'name query parameter is required' }, { status: 400 })
  }

  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/JSON`

  const upstream = await fetch(url, { headers: { accept: 'application/json' } })

  if (upstream.status === 404) {
    return Response.json({ compounds: [] }, { status: 404 })
  }

  if (!upstream.ok) {
    const text = await upstream.text()
    return Response.json(
      { error: `PubChem error (${upstream.status}): ${text.slice(0, 300)}` },
      { status: upstream.status },
    )
  }

  const data: PubChemResponse = await upstream.json()

  if (data.Fault) {
    return Response.json({ compounds: [] }, { status: 404 })
  }

  const compounds: CompoundResult[] = (data.PC_Compounds ?? []).slice(0, 12).map((c) => ({
    cid: c.id.id.cid,
    name:
      findProp(c.props, 'IUPAC Name', 'Preferred') ??
      findProp(c.props, 'IUPAC Name') ??
      name,
    molecularFormula: findProp(c.props, 'Molecular Formula'),
    molecularWeight: findProp(c.props, 'Molecular Weight'),
  }))

  return Response.json({ compounds })
}
