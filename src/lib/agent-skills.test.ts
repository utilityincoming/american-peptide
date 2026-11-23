import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import {
  AGENT_SKILLS,
  AGENT_SKILLS_SCHEMA,
  agentSkillsIndex,
  getAgentSkill,
} from './agent-skills'

describe('agent skills discovery index', () => {
  it('declares the RFC 0.2.0 schema and a non-empty skills array', () => {
    const idx = agentSkillsIndex()
    expect(idx.$schema).toBe(AGENT_SKILLS_SCHEMA)
    expect(idx.skills.length).toBe(AGENT_SKILLS.length)
    expect(idx.skills.length).toBeGreaterThan(0)
  })

  it('gives every entry the required fields in valid form', () => {
    for (const entry of agentSkillsIndex().skills) {
      expect(entry.name).toMatch(/^[a-z0-9-]+$/)
      expect(entry.type).toBe('skill-md')
      expect(entry.description.trim().length).toBeGreaterThan(10)
      expect(entry.url).toBe(`/.well-known/agent-skills/${entry.name}/SKILL.md`)
      expect(entry.digest).toMatch(/^sha256:[0-9a-f]{64}$/)
    }
  })

  it("each entry's digest matches the sha256 of the skill body served at its url", () => {
    for (const entry of agentSkillsIndex().skills) {
      const skill = getAgentSkill(entry.name)
      expect(skill).toBeDefined()
      const expected =
        'sha256:' + createHash('sha256').update(skill!.content, 'utf8').digest('hex')
      expect(entry.digest).toBe(expected)
    }
  })

  it('the peptide-catalog skill is a well-formed SKILL.md', () => {
    const skill = getAgentSkill('peptide-catalog')
    expect(skill).toBeDefined()
    // H1 title on the first line, plus the sections an agent needs.
    expect(skill!.content.startsWith('# ')).toBe(true)
    expect(skill!.content).toContain('/api/catalog')
    expect(skill!.content).toContain('CC BY 4.0')
    expect(skill!.content).toContain('not medical advice')
  })
})
