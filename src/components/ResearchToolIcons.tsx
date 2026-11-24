import type { ReactNode } from 'react'

type IconProps = { className?: string }

function IconFrame({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function PeptideAgentIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7 4H4v16h3m10-16h3v16h-3M9.5 14l5-4" />
      <circle cx="9" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

export function PeptideForgeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m5.6 14.8 3.8-3.6m3.3-.5 2.8 1.7M17.5 6H22m-2.25-2.25v4.5" />
      <circle cx="4" cy="16.5" r="2" />
      <circle cx="11" cy="10" r="2" />
      <circle cx="17" cy="13.5" r="2" strokeDasharray="2 2" />
    </IconFrame>
  )
}

export function ClinicalPulseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 4v15h16M7 14h3l3-6 3 4h4" />
      <circle cx="13" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

export function CompoundSearchIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 5 5m-6.5-8V8L10 6 6.5 8v4l3.5 2z" />
    </IconFrame>
  )
}
