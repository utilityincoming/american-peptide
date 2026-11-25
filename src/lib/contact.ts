// Canonical contact / privacy addresses for AmericanPeptide.com.
//
// Environment-driven so deployments can override without a code change:
//   - NEXT_PUBLIC_CONTACT_EMAIL (general inquiries & catalog corrections)
//   - NEXT_PUBLIC_PRIVACY_EMAIL (privacy policy & data-rights requests)
//
// TODO(contact-mailbox): Confirm final @americanpeptide.com mailbox routing
// (privacy@americanpeptide.com / contact@americanpeptide.com) in DNS/MX or set
// NEXT_PUBLIC_CONTACT_EMAIL and NEXT_PUBLIC_PRIVACY_EMAIL in Vercel project env.
export const TODO_CONFIRM_CONTACT_MAILBOX = true

export const DEFAULT_CONTACT_EMAIL = 'contact@americanpeptide.com'
export const DEFAULT_PRIVACY_EMAIL = 'privacy@americanpeptide.com'

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL

export const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  DEFAULT_PRIVACY_EMAIL
