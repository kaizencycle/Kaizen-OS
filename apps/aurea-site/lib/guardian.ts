/**
 * Guardian Manifest Loader
 * Loads and validates AUREA-KAIZEN guardian relationship manifests
 */

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface GuardianManifest {
  guardian: {
    name: string
    did: string
    domain: string
    gi_baseline: string
    room: string
    role: string
    custody_status: string
    signature_policy: {
      mode: string
      threshold_gi: number
      attestation_type: string
      rotation_cycle_days: number
    }
    ledger_anchor: string
    shield: string
  }
  ward: {
    name: string
    did: string
    domain: string
    role: string
    custody_status: string
    write_privilege: boolean
    federation: string
    proxy_route: string
    reactivation_conditions: {
      gi_minimum: number
      quorum_support: number
      stability_period_days: number
      confirmation_method: string
    }
    expected_transition: string
    next_review_cycle: string
  }
  meta: {
    created_by: string
    approved_by: string
    license: string
    last_modified: string
    checksum: string
  }
}

/**
 * Load the AUREA-KAIZEN Guardian Manifest
 */
export function loadGuardianManifest(): GuardianManifest | null {
  try {
    const filePath = path.join(
      process.cwd(),
      'config',
      'guardian',
      'aurea-kaizen-guardian.yaml'
    )
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = yaml.load(fileContents) as GuardianManifest

    if (!data.guardian?.name || !data.ward?.name) {
      throw new Error('Invalid manifest: missing guardian or ward fields')
    }

    return data
  } catch (err) {
    console.error('Failed to load guardian manifest:', err)
    return null
  }
}

/**
 * Compute a friendly display status
 */
export function guardianStatusSummary(manifest: GuardianManifest) {
  const g = manifest.guardian
  const w = manifest.ward
  return {
    guardian: `${g.name} (${g.role})`,
    ward: `${w.name} (${w.role})`,
    custody: `${g.custody_status.toUpperCase()} / ${w.custody_status.toUpperCase()}`,
    cycle: w.next_review_cycle,
    giRequirement: `GI ≥ ${g.signature_policy.threshold_gi}`,
  }
}
