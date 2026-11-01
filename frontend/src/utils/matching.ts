import type { ItemReport, MatchResult, MatchStrength } from '@/types'
import { listReports } from '@/services/reports'

/* Transparent attribute matching, kept apart from the UI so a Java service can
   replace it later. It compares what a person typed into the form — name,
   category, location, description words and the stated features. It does not
   look at the photographs: there is no image recognition in this prototype and
   nothing in the interface claims there is. */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'with', 'of', 'in', 'on', 'at', 'is', 'it', 'my', 'to',
  'for', 'from', 'near', 'by', 'has', 'have', 'was', 'were', 'this', 'that',
  'black', 'blue', 'grey', 'gray', 'white', 'small', 'left', 'found', 'lost',
])

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )
}

function overlap(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((w) => b.has(w))
}

export const STRENGTH_LABEL: Record<MatchStrength, string> = {
  strong: 'Strong lead',
  possible: 'Worth checking',
  weak: 'Faint lead',
}

/**
 * Ranks found reports against one lost report.
 * Score is the number of attributes that agree, out of five:
 * category, name words, location, description words, distinguishing features.
 */
export function findMatches(lost: ItemReport, candidates?: ItemReport[]): MatchResult[] {
  const pool = (candidates ?? listReports()).filter(
    (r) => r.type !== lost.type && r.status !== 'returned' && r.id !== lost.id,
  )

  const lostName = words(lost.name)
  const lostDesc = words(lost.description)
  const lostFeat = words(lost.features)

  const results: MatchResult[] = pool.map((report) => {
    const reasons: string[] = []
    let score = 0

    if (report.category === lost.category) {
      score += 1
      reasons.push('Same category')
    }

    const nameHits = overlap(lostName, words(report.name))
    if (nameHits.length > 0) {
      score += 1
      reasons.push(`Item name mentions “${nameHits.slice(0, 2).join('”, “')}”`)
    }

    if (report.location === lost.location) {
      score += 1
      reasons.push(`Same campus location — ${report.location}`)
    }

    const descHits = overlap(lostDesc, words(report.description))
    if (descHits.length > 1) {
      score += 1
      reasons.push(`Descriptions overlap: ${descHits.slice(0, 3).join(', ')}`)
    }

    const featHits = overlap(lostFeat, words(report.features))
    if (featHits.length > 0) {
      score += 1
      reasons.push(`Distinguishing detail agrees: ${featHits.slice(0, 2).join(', ')}`)
    }

    const strength: MatchStrength = score >= 4 ? 'strong' : score >= 3 ? 'possible' : 'weak'
    return { report, score, strength, reasons }
  })

  return results
    .filter((m) => m.score >= 2)
    .sort((a, b) => b.score - a.score || (a.report.date < b.report.date ? 1 : -1))
}

/** 0–100 demo relevance, mapped from the attribute count so the bar is honest. */
export function relevance(score: number): number {
  return Math.min(100, Math.round((score / 5) * 100))
}

/* The endpoint a Java service would serve, kept here so the page can name what
   it will call once the backend exists. */
export const matching = {
  apiNote:
    'Prototype only: matches are computed in the browser from the report fields. The Java service will serve GET /api/reports/{id}/matches with the same reasons.',
}
