import { describe, it, expect } from 'vitest'
import { chunkForStream, toolLabel } from './agent-stream'

describe('toolLabel', () => {
  it('maps known grounding tools to friendly labels', () => {
    expect(toolLabel('search_pubmed')).toBe('Searching PubMed')
    expect(toolLabel('search_clinical_trials')).toBe('Searching ClinicalTrials.gov')
    expect(toolLabel('grade_coa')).toBe('Grading the certificate')
  })
  it('falls back to a generic label for unknown names', () => {
    expect(toolLabel('something_new')).toBe('Researching sources')
    expect(toolLabel('')).toBe('Researching sources')
  })
})

describe('chunkForStream', () => {
  it('returns nothing for empty input', () => {
    expect(chunkForStream('')).toEqual([])
  })

  it('splits on blank lines into separate blocks', () => {
    expect(chunkForStream('First paragraph.\n\nSecond paragraph.')).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ])
  })

  it('rejoining blocks with a blank line reconstructs the text (blank runs collapsed)', () => {
    const text = '# Title\n\nIntro line.\n\n- a\n- b\n\nClosing.'
    expect(chunkForStream(text).join('\n\n')).toBe(text)
  })

  it('keeps a single paragraph as one block', () => {
    expect(chunkForStream('Just one line, no breaks.')).toEqual(['Just one line, no breaks.'])
  })

  it('never splits inside a fenced code block', () => {
    const text = 'Before.\n\n```\nline one\n\nline two inside the fence\n```\n\nAfter.'
    const blocks = chunkForStream(text)
    // The whole fence (including its internal blank line) stays in one block.
    const fenceBlock = blocks.find((b) => b.includes('```'))
    expect(fenceBlock).toContain('line one')
    expect(fenceBlock).toContain('line two inside the fence')
    expect(fenceBlock!.match(/```/g)).toHaveLength(2)
    expect(blocks[0]).toBe('Before.')
    expect(blocks[blocks.length - 1]).toBe('After.')
  })

  it('does not drop content when a fence closes the text', () => {
    const text = 'Intro.\n\n```\ncode\n```'
    expect(chunkForStream(text).join('\n\n')).toBe(text)
  })
})
