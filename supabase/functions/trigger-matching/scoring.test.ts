// scoring.test.ts — Unit Tests für den Matching-Algorithmus (Story 5.1)
// Ausführen: deno test scoring.test.ts
import { assertEquals, assertNotEquals } from 'jsr:@std/assert'
import {
  calculateMatchScore,
  classifyCategory,
  MIN_SCORE_THRESHOLD,
  SCORE_WEIGHTS,
} from './scoring.ts'

// ── Basis-Fixtures ────────────────────────────────────────────────────────────

const BASE_JOB = {
  jobSkills: [
    { skill_name: 'TypeScript', importance: 9, is_required: true },
    { skill_name: 'React',      importance: 8, is_required: true },
    { skill_name: 'PostgreSQL', importance: 6, is_required: false },
  ],
  jobLocationCity:   'Berlin',
  jobExperienceMin:  3,
  jobExperienceMax:  8,
  jobSalaryMin:      60_000,
  jobSalaryMax:      80_000,
}

const BASE_CANDIDATE = {
  candidateSkills: [
    { skill_name: 'TypeScript', skill_level: 4, years_experience: 3 },
    { skill_name: 'React',      skill_level: 4, years_experience: 2 },
    { skill_name: 'PostgreSQL', skill_level: 3, years_experience: 1 },
  ],
  candidateLocationCity:      'Berlin',
  candidateExperienceYears:   5,
  candidateSalaryExpectation: 70_000,
  candidateAvailability:      'immediate',
  candidateSwitchWillingness: 9,
}

// ── classifyCategory ──────────────────────────────────────────────────────────

Deno.test('classifyCategory — top_match ab 80', () => {
  assertEquals(classifyCategory(80), 'top_match')
  assertEquals(classifyCategory(95), 'top_match')
  assertEquals(classifyCategory(100), 'top_match')
})

Deno.test('classifyCategory — good_match 65–79', () => {
  assertEquals(classifyCategory(65), 'good_match')
  assertEquals(classifyCategory(72), 'good_match')
  assertEquals(classifyCategory(79), 'good_match')
})

Deno.test('classifyCategory — interesting 50–64', () => {
  assertEquals(classifyCategory(50), 'interesting')
  assertEquals(classifyCategory(57), 'interesting')
  assertEquals(classifyCategory(64), 'interesting')
})

// ── calculateMatchScore — Schwellwert ─────────────────────────────────────────

Deno.test('calculateMatchScore — sehr schlechter Match gibt null zurück', () => {
  const result = calculateMatchScore({
    jobSkills: [
      { skill_name: 'COBOL',   importance: 10, is_required: true },
      { skill_name: 'Fortran', importance: 10, is_required: true },
    ],
    jobLocationCity:  'München',
    jobExperienceMin: 10,
    jobExperienceMax: 20,
    jobSalaryMin:     30_000,
    jobSalaryMax:     40_000,
    candidateSkills:            [],
    candidateLocationCity:      'Hamburg',
    candidateExperienceYears:   0,
    candidateSalaryExpectation: 90_000,
    candidateAvailability:      '6_months',
    candidateSwitchWillingness: 1,
  })
  assertEquals(result, null, 'Schlechter Match muss null (unter Schwellwert) ergeben')
})

// ── calculateMatchScore — Skill Score ────────────────────────────────────────

Deno.test('calculateMatchScore — keine Skill-Anforderung → voller Skill-Score', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    jobSkills: [],
    ...BASE_CANDIDATE,
  })
  assertNotEquals(result, null)
  assertEquals(result!.skillScore, 100)
})

Deno.test('calculateMatchScore — alle Skills vorhanden → hoher Skill-Score', () => {
  const result = calculateMatchScore({ ...BASE_JOB, ...BASE_CANDIDATE })
  assertNotEquals(result, null)
  assertEquals(result!.skillScore, 100, 'Alle 3/3 Skills vorhanden → 100%')
})

Deno.test('calculateMatchScore — required Skills fehlen → reduzierter Skill-Score', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateSkills: [
      { skill_name: 'PostgreSQL', skill_level: 3, years_experience: 1 },
      // TypeScript + React (required) fehlen
    ],
  })
  assertNotEquals(result, null, 'Kandidat mit nur optionalem Skill sollte noch ein Match ergeben')
  assertEquals(result!.skillScore < 60, true, `Skill-Score sollte reduziert sein, war ${result!.skillScore}`)
})

// ── calculateMatchScore — Experience Score ────────────────────────────────────

Deno.test('calculateMatchScore — Erfahrung im Range → voller Experience-Score', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateExperienceYears: 5,  // Range: 3–8
  })
  assertNotEquals(result, null)
  assertEquals(result!.experienceScore, 100)
})

Deno.test('calculateMatchScore — Erfahrung zu gering → reduzierter Experience-Score', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateExperienceYears: 1,  // Min ist 3 → 2 Jahre Lücke → 70 Punkte
  })
  assertNotEquals(result, null)
  assertEquals(result!.experienceScore, 70, `Erwartet 70, war ${result!.experienceScore}`)
})

Deno.test('calculateMatchScore — Erfahrung überqualifiziert → 80 Punkte', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateExperienceYears: 15,  // Max ist 8
  })
  assertNotEquals(result, null)
  assertEquals(result!.experienceScore, 80)
})

// ── calculateMatchScore — Location Score ─────────────────────────────────────

Deno.test('calculateMatchScore — gleiche Stadt → voller Location-Score', () => {
  const result = calculateMatchScore({ ...BASE_JOB, ...BASE_CANDIDATE })
  assertNotEquals(result, null)
  assertEquals(result!.locationScore, 100)
})

Deno.test('calculateMatchScore — verschiedene Städte → 30 Punkte (Remote-Basis)', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateLocationCity: 'Hamburg',
  })
  assertNotEquals(result, null)
  assertEquals(result!.locationScore, 30)
})

// ── calculateMatchScore — Availability Score ──────────────────────────────────

Deno.test('calculateMatchScore — immediate Verfügbarkeit → 100 Punkte', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateAvailability: 'immediate',
  })
  assertNotEquals(result, null)
  assertEquals(result!.availabilityScore, 100)
})

Deno.test('calculateMatchScore — flexible Verfügbarkeit → 40 Punkte', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateAvailability: 'flexible',
  })
  assertNotEquals(result, null)
  assertEquals(result!.availabilityScore, 40)
})

Deno.test('calculateMatchScore — immediate schlägt flexible', () => {
  const immediate = calculateMatchScore({ ...BASE_JOB, ...BASE_CANDIDATE, candidateAvailability: 'immediate' })
  const flexible  = calculateMatchScore({ ...BASE_JOB, ...BASE_CANDIDATE, candidateAvailability: 'flexible'  })
  assertNotEquals(immediate, null)
  assertNotEquals(flexible, null)
  assertEquals(immediate!.availabilityScore > flexible!.availabilityScore, true)
})

// ── calculateMatchScore — Salary Score ────────────────────────────────────────

Deno.test('calculateMatchScore — Gehalt im Range → 100 Punkte', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateSalaryExpectation: 70_000,  // Range: 60k–80k
  })
  assertNotEquals(result, null)
  assertEquals(result!.salaryScore, 100)
})

Deno.test('calculateMatchScore — Gehalt über Max → reduzierter Salary-Score', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    ...BASE_CANDIDATE,
    candidateSalaryExpectation: 100_000,  // Max: 80k → +25% Überschreitung
  })
  assertNotEquals(result, null)
  assertEquals(result!.salaryScore < 100, true)
})

Deno.test('calculateMatchScore — keine Gehaltsdaten → neutraler Score (70)', () => {
  const result = calculateMatchScore({
    ...BASE_JOB,
    jobSalaryMin: null,
    jobSalaryMax: null,
    ...BASE_CANDIDATE,
    candidateSalaryExpectation: null,
  })
  assertNotEquals(result, null)
  assertEquals(result!.salaryScore, 70)
})

// ── calculateMatchScore — Gewichtungssumme ────────────────────────────────────

Deno.test('SCORE_WEIGHTS summieren zu 1.0', () => {
  const total = Object.values(SCORE_WEIGHTS).reduce((sum, w) => sum + w, 0)
  assertEquals(Math.abs(total - 1.0) < 0.0001, true, `Gewichte summieren zu ${total}, erwartet 1.0`)
})

// ── calculateMatchScore — Gesamt-Struktur ─────────────────────────────────────

Deno.test('calculateMatchScore — perfekter Match hat alle Felder und score ≥ threshold', () => {
  const result = calculateMatchScore({ ...BASE_JOB, ...BASE_CANDIDATE })
  assertNotEquals(result, null)
  assertEquals(typeof result!.total,                 'number')
  assertEquals(typeof result!.category,              'string')
  assertEquals(typeof result!.skillScore,            'number')
  assertEquals(typeof result!.experienceScore,       'number')
  assertEquals(typeof result!.locationScore,         'number')
  assertEquals(typeof result!.availabilityScore,     'number')
  assertEquals(typeof result!.salaryScore,           'number')
  assertEquals(typeof result!.switchWillingnessScore,'number')
  assertEquals(result!.total >= MIN_SCORE_THRESHOLD, true)
})
