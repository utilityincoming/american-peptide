'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts'
import { chargeCurve, hydropathyWindow } from '@/lib/research-workspace/sequence'

const COLORS = ['#7EE0B5', '#7DD3FC', '#C4B5FD', '#F9A8D4']

export function seriesColor(index: number): string {
  return COLORS[index % COLORS.length]
}

interface Chain {
  name: string
  codes: string[]
}

export function HydropathyChart({ chains }: { chains: Chain[] }) {
  const usable = chains.filter((c) => c.codes.length > 0)
  if (usable.length === 0) {
    return <EmptyChart label="No parseable sequence to plot." />
  }
  const windows = usable.map((c) => hydropathyWindow(c.codes))
  const max = Math.max(...windows.map((w) => w.length))
  const data = Array.from({ length: max }, (_, i) => {
    const row: Record<string, number | null> = { pos: i + 1 }
    windows.forEach((w, idx) => {
      row[`s${idx}`] = w[i]?.kd ?? null
    })
    return row
  })
  return (
    <ChartFrame title="Hydropathy" caption="Kyte–Doolittle, 7-residue window. Higher is more hydrophobic.">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="pos" stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} width={36} domain={sharedDomain(data, usable.length)} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {usable.map((c, i) => (
            <Line
              key={c.name}
              type="monotone"
              dataKey={`s${i}`}
              name={c.name}
              stroke={seriesColor(i)}
              dot={false}
              strokeWidth={2}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function ChargeChart({ chains }: { chains: Chain[] }) {
  const usable = chains.filter((c) => c.codes.length > 0)
  if (usable.length === 0) return <EmptyChart label="Charge needs a standard-residue sequence." />
  const curves = usable.map((c) => chargeCurve(c.codes))
  const data = curves[0].map((pt, i) => {
    const row: Record<string, number> = { ph: pt.ph }
    curves.forEach((curve, idx) => {
      row[`s${idx}`] = curve[i].charge
    })
    return row
  })
  return (
    <ChartFrame title="Charge vs pH" caption="Henderson–Hasselbalch estimate (Lehninger pKa set). Not a measured titration.">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="ph" stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} width={36} domain={sharedDomain(data, usable.length)} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {usable.map((c, i) => (
            <Line
              key={c.name}
              type="monotone"
              dataKey={`s${i}`}
              name={c.name}
              stroke={seriesColor(i)}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

export function PropertyBars({
  rows,
}: {
  rows: { name: string; gravy: number | null; charge: number | null; length: number | null }[]
}) {
  const data = rows.map((r, index) => ({
    name: r.name.length > 22 ? `${r.name.slice(0, 18)}… (${index + 1})` : r.name,
    GRAVY: r.gravy,
    'Charge @ 7.4': r.charge,
    Length: r.length,
  }))
  if (data.length === 0) return null
  return (
    <ChartFrame title="Key properties" caption="Length is residue count. Charge is the pH 7.4 estimate.">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} width={36} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar dataKey="GRAVY" fill="#7EE0B5" />
          <Bar dataKey="Charge @ 7.4" fill="#7DD3FC" />
          <Bar dataKey="Length" fill="#C4B5FD" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

function ChartFrame({
  title,
  caption,
  children,
}: {
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <figure className="rounded-2xl border border-hairline bg-fill p-4">
      <figcaption className="mb-2">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink/50">{caption}</p>
      </figcaption>
      {children}
    </figure>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-hairline text-sm text-ink/50">
      {label}
    </div>
  )
}

function sharedDomain(data: Record<string, number | null>[], series: number): [number, number] {
  const values: number[] = []
  for (const row of data) {
    for (let i = 0; i < series; i++) {
      const value = row[`s${i}`]
      if (typeof value === 'number') values.push(value)
    }
  }
  if (values.length === 0) return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max(0.2, (max - min) * 0.08)
  return [min - pad, max + pad]
}

const tooltipStyle = {
  background: '#121816',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  fontSize: 12,
}
