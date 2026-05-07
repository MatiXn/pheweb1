// scoring.ts — Pure matching score functions for trigger-matching Edge Function
// Story 5.1: Matching-Algorithmus Kern-Engine
//
// Scoring-Dimensionen (angepasst an reales DB-Schema):
//   Skill Match:         40%  (skill_name text matching, weighted by is_required/importance)
//   Experience Match:    20%  (experience_years vs job experience_min/max)
//   Location Match:      15%  (location_city exact match)
//   Availability Match:  10%  (enum order: immediate > 1_month > ... > flexible)
//   Salary Match:        10%  (salary_expectation vs salary_min/max)
//   Switch Willingness:   5%  (switch_willingness 1–10 scale)
//
// Threshold: 50 (score < 50 → kein Match-Eintrag, null zurückgeben)

export const SCORE_WEIGHTS = {
  skill:            0.40,
  experience:       0.20,
  location:         0.15,
  availability:     0.10,
  salary:           0.10,
  switchWillingness: 0.05,
} as const

export const MIN_SCORE_THRESHOLD = 50

export type MatchCategory = 'top_match' | 'good_match' | 'interesting'

export function classifyCategory(score: number): MatchCategory {
  if (score >= 80) return 'top_match'
  if (score >= 65) return 'good_match'
  return 'interesting'
}

// Availability enum order: früher = besser für Unternehmen
const AVAILABILITY_SCORE: Record<string, number> = {
  immediate:  100,
  '1_month':   85,
  '3_months':  70,
  '6_months':  55,
  flexible:    40,
}

export interface JobSkill {
  skill_name: string
  importance: number      // 1–10
  is_required: boolean
}

export interface CandidateSkill {
  skill_name: string
  skill_level: number     // 1–5
  years_experience: number | null
}

export interface ScoringParams {
  // Job
  jobSkills: JobSkill[]
  jobLocationCity: string | null
  jobExperienceMin: number
  jobExperienceMax: number | null
  jobSalaryMin: number | null
  jobSalaryMax: number | null
  // Candidate
  candidateSkills: CandidateSkill[]
  candidateLocationCity: string | null
  candidateExperienceYears: number
  candidateSalaryExpectation: number | null
  candidateAvailability: string
  candidateSwitchWillingness: number
}

export interface ScoreBreakdown {
  total: number
  category: MatchCategory
  skillScore: number
  experienceScore: number
  locationScore: number
  availabilityScore: number
  salaryScore: number
  switchWillingnessScore: number
}

export function calculateMatchScore(params: ScoringParams): ScoreBreakdown | null {
  const {
    jobSkills, jobLocationCity, jobExperienceMin, jobExperienceMax,
    jobSalaryMin, jobSalaryMax,
    candidateSkills, candidateLocationCity, candidateExperienceYears,
    candidateSalaryExpectation, candidateAvailability, candidateSwitchWillingness,
  } = params

  // ── 1. Skill Score (40%) ──────────────────────────────────────────────────
  let skillScore: number
  if (jobSkills.length === 0) {
    skillScore = 100  // Keine Skill-Anforderung → voller Score
  } else {
    const candidateSkillNames = new Set(
      candidateSkills.map(cs => cs.skill_name.toLowerCase().trim())
    )
    const requiredSkills = jobSkills.filter(js => js.is_required)
    const allNames = jobSkills.map(js => js.skill_name.toLowerCase().trim())
    const matchedCount = allNames.filter(n => candidateSkillNames.has(n)).length

    if (requiredSkills.length > 0) {
      // Required skills fehlen → schwere Gewichtung
      const requiredNames = requiredSkills.map(js => js.skill_name.toLowerCase().trim())
      const requiredMatchedCount = requiredNames.filter(n => candidateSkillNames.has(n)).length
      const requiredRatio = requiredMatchedCount / requiredSkills.length
      const overallRatio = matchedCount / jobSkills.length
      // 70% von required ratio + 30% von overall ratio
      skillScore = (requiredRatio * 0.70 + overallRatio * 0.30) * 100
    } else {
      skillScore = (matchedCount / jobSkills.length) * 100
    }
  }

  // ── 2. Experience Score (20%) ─────────────────────────────────────────────
  let experienceScore: number
  if (candidateExperienceYears >= jobExperienceMin) {
    if (jobExperienceMax === null || candidateExperienceYears <= jobExperienceMax) {
      experienceScore = 100  // Exakt im Range
    } else {
      experienceScore = 80   // Überqualifiziert — noch akzeptabel
    }
  } else {
    // Unterqualifiziert: 15 Punkte Abzug pro fehlendem Jahr, Minimum 0
    const gap = jobExperienceMin - candidateExperienceYears
    experienceScore = Math.max(0, 100 - gap * 15)
  }

  // ── 3. Location Score (15%) ───────────────────────────────────────────────
  const locationScore = (
    candidateLocationCity &&
    jobLocationCity &&
    candidateLocationCity.toLowerCase().trim() === jobLocationCity.toLowerCase().trim()
  ) ? 100 : 30  // 30% Basis für Flexibilität/Remote-Bereitschaft

  // ── 4. Availability Score (10%) ───────────────────────────────────────────
  const availabilityScore = AVAILABILITY_SCORE[candidateAvailability] ?? 40

  // ── 5. Salary Score (10%) ─────────────────────────────────────────────────
  let salaryScore: number
  if (!candidateSalaryExpectation || (!jobSalaryMin && !jobSalaryMax)) {
    salaryScore = 70  // Keine Gehaltsdaten → neutral
  } else if (jobSalaryMax && candidateSalaryExpectation > jobSalaryMax) {
    // Kandidat zu teuer
    const overage = (candidateSalaryExpectation - jobSalaryMax) / jobSalaryMax
    salaryScore = Math.max(0, Math.round(100 - overage * 200))
  } else if (jobSalaryMin && candidateSalaryExpectation < jobSalaryMin) {
    salaryScore = 85  // Unter Minimum → für Unternehmen gut, leichter Abzug für Fairness
  } else {
    salaryScore = 100  // Im Range
  }

  // ── 6. Switch Willingness Score (5%) ─────────────────────────────────────
  // switch_willingness ist 1–10; auf 0–100 skalieren
  const switchWillingnessScore = Math.min(100, Math.max(0, candidateSwitchWillingness * 10))

  // ── Weighted Total ────────────────────────────────────────────────────────
  const total = Math.round(
    skillScore            * SCORE_WEIGHTS.skill +
    experienceScore       * SCORE_WEIGHTS.experience +
    locationScore         * SCORE_WEIGHTS.location +
    availabilityScore     * SCORE_WEIGHTS.availability +
    salaryScore           * SCORE_WEIGHTS.salary +
    switchWillingnessScore * SCORE_WEIGHTS.switchWillingness
  )

  if (total < MIN_SCORE_THRESHOLD) return null

  return {
    total,
    category: classifyCategory(total),
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    locationScore: Math.round(locationScore),
    availabilityScore: Math.round(availabilityScore),
    salaryScore: Math.round(salaryScore),
    switchWillingnessScore: Math.round(switchWillingnessScore),
  }
}
