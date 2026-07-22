// The one place structured data becomes a <script>. Centralizing this keeps
// every JSON-LD block on the same, correct contract:
//   • type="application/ld+json" (never a malformed MIME type)
//   • the serialized body has `<` escaped to <, so a stray "</script>" in
//     any string field can't break out of the tag (the inline versions this
//     replaces did not guard against that).
//
// Pass a single node or a linked @graph array.
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
