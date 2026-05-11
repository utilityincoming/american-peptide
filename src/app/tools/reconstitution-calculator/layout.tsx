import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Peptide Reconstitution Calculator — AmericanPeptide.com',
  description:
    'Free peptide reconstitution calculator. Calculate bacteriostatic water volume, concentration per injection, and dosing from vial size and desired dose. Essential tool for peptide researchers.',
}

export default function ReconstitutionCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
