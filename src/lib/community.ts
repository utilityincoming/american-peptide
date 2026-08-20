// The American Peptide community (Telegram) - an open, mutual-help room for
// researchers, framed as community rather than vendor endorsement.
//
// Public links point at the /go/community chokepoint rather than the raw invite,
// so a join click feeds the same no-PII referral counter as a vendor outbound
// (see lib/referrals). The invite URL itself is resolved server-side in the /go
// route and is never emitted into the page bundle. Distinct from the Peptide
// Agent feedback group linked on /about.
//
// `community` is a reserved referral id: no vendor uses it, so it shares the same
// go:clk:v:<id> counter namespace without colliding.
export const COMMUNITY_REF_ID = 'community'

/** The tracked internal path readers actually click. */
export const COMMUNITY_PATH = `/go/${COMMUNITY_REF_ID}`

/** The real Telegram invite the chokepoint 302s to. Kept server-side. */
export const COMMUNITY_URL = 'https://t.me/+n5ymMHicPbNlNzcx'
