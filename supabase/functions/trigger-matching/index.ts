import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { calculateMatchScore } from './scoring.ts'

// trigger-matching — Story 5.1: Matching-Engine Kern
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false)
// Verarbeitet alle jobs WHERE pending_rekalkulierung = TRUE AND status = 'active'

const VISIBLE_UNTIL_DAYS = 30   // Matches sind 30 Tage sichtbar
const BATCH_SIZE = 100          // UPSERT-Batch-Größe

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const startTime = Date.now()
  let totalJobs = 0
  let totalCandidates = 0
  let upserted = 0
  let skipped = 0
  let errors = 0

  try {
    // ── 1. Jobs laden die Rekalkulierung benötigen ──────────────────────────
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id, title, location_city,
        experience_min, experience_max,
        salary_min, salary_max,
        job_skills ( skill_name, importance, is_required )
      `)
      .eq('pending_rekalkulierung', true)
      .eq('status', 'active')

    if (jobsError) throw new Error(`Jobs query failed: ${jobsError.message}`)

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine Jobs zur Rekalkulierung', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    totalJobs = jobs.length
    console.log(JSON.stringify({ event: 'matching_start', totalJobs }))

    // ── 2. Alle aktiven Kandidaten laden (einmalig, nicht pro Job) ──────────
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select(`
        id, location_city, experience_years,
        salary_expectation, availability, switch_willingness,
        candidate_skills ( skill_name, skill_level, years_experience )
      `)
      .eq('status', 'active')
      .eq('consent_given', true)

    if (candidatesError) throw new Error(`Candidates query failed: ${candidatesError.message}`)

    if (!candidates || candidates.length === 0) {
      // Keine Kandidaten → Jobs trotzdem als verarbeitet markieren
      const ids = jobs.map(j => (j as Record<string, unknown>).id as string)
      await supabase.from('jobs').update({ pending_rekalkulierung: false }).in('id', ids)
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine aktiven Kandidaten', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    totalCandidates = candidates.length
    const visibleUntil = new Date(Date.now() + VISIBLE_UNTIL_DAYS * 24 * 60 * 60 * 1000).toISOString()

    // ── 3. Pro Job: Scores berechnen + UPSERT ──────────────────────────────
    for (const job of jobs) {
      try {
        const j = job as Record<string, unknown>
        const jobSkills = (j.job_skills as Array<{ skill_name: string; importance: number; is_required: boolean }>) ?? []

        const matchRows: Array<Record<string, unknown>> = []

        for (const candidate of candidates) {
          const c = candidate as Record<string, unknown>
          const candidateSkills = (c.candidate_skills as Array<{ skill_name: string; skill_level: number; years_experience: number | null }>) ?? []

          const result = calculateMatchScore({
            jobSkills,
            jobLocationCity: j.location_city as string | null,
            jobExperienceMin: (j.experience_min as number) ?? 0,
            jobExperienceMax: j.experience_max as number | null,
            jobSalaryMin: j.salary_min as number | null,
            jobSalaryMax: j.salary_max as number | null,
            candidateSkills,
            candidateLocationCity: c.location_city as string | null,
            candidateExperienceYears: (c.experience_years as number) ?? 0,
            candidateSalaryExpectation: c.salary_expectation as number | null,
            candidateAvailability: (c.availability as string) ?? 'flexible',
            candidateSwitchWillingness: (c.switch_willingness as number) ?? 5,
          })

          if (!result) {
            skipped++
            continue
          }

          matchRows.push({
            job_id:                   j.id,
            candidate_id:             c.id,
            score:                    result.total,
            category:                 result.category,
            skill_score:              result.skillScore,
            experience_score:         result.experienceScore,
            salary_score:             result.salaryScore,
            location_score:           result.locationScore,
            availability_score:       result.availabilityScore,
            switch_willingness_score: result.switchWillingnessScore,
            education_match:          'not_evaluated',  // TODO Story 5.x: Education matching
            visible_until:            visibleUntil,
          })
        }

        // UPSERT in Batches (ON CONFLICT: job_id + candidate_id → Scores aktualisieren)
        for (let i = 0; i < matchRows.length; i += BATCH_SIZE) {
          const batch = matchRows.slice(i, i + BATCH_SIZE)
          const { error: upsertError } = await supabase
            .from('matches')
            .upsert(batch, { onConflict: 'job_id,candidate_id' })

          if (upsertError) {
            console.error(JSON.stringify({ event: 'upsert_error', jobId: j.id, error: upsertError.message }))
            errors++
          } else {
            upserted += batch.length
          }
        }

        // Job als verarbeitet markieren (nur bei Erfolg — bei Fehler bleibt Flag für Retry)
        await supabase.from('jobs').update({ pending_rekalkulierung: false }).eq('id', j.id)

        console.log(JSON.stringify({
          event: 'job_processed',
          jobId: j.id,
          candidatesEvaluated: candidates.length,
          matchesUpserted: matchRows.length,
          belowThreshold: candidates.length - matchRows.length,
        }))

      } catch (jobError) {
        // Per-Job Fehler: pending_rekalkulierung NICHT zurücksetzen → Retry beim nächsten Cron-Lauf
        console.error(JSON.stringify({
          event: 'job_error',
          jobId: (job as Record<string, unknown>).id,
          error: String(jobError),
        }))
        errors++
      }
    }

    const summary = {
      status: 'ok',
      totalJobs,
      totalCandidates,
      upserted,
      skipped,
      errors,
      durationMs: Date.now() - startTime,
    }

    console.log(JSON.stringify({ event: 'matching_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'matching_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'MATCHING_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
