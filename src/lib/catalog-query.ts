export function normalizeCatalogQuery(value: string | null | undefined): string | null {
  return value?.trim().toLowerCase() || null
}

// Records are immutable for the lifetime of a catalog build. Cache by record
// identity so repeated queries never rebuild the same searchable text.
type SearchRecord = {
  name: string
  aliases?: string[]
  shortDescription: string
  description: string
}

export function createCatalogMatcher(includeFullDescription: boolean) {
  const index = new WeakMap<SearchRecord, string>()
  return (record: SearchRecord, query: string) => {
    let text = index.get(record)
    if (text === undefined) {
      text = [
        record.name,
        record.shortDescription,
        ...(includeFullDescription ? [record.description] : []),
        ...(record.aliases ?? []),
      ].join(' ').toLowerCase()
      index.set(record, text)
    }
    return text.includes(query)
  }
}
