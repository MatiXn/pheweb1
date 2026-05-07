// Centralized tier limits and prices — Story 8.1
// Single source of truth for all tier-related enforcement and display logic

export const TIER_LIMITS: Record<string, number> = {
  basis:        1,
  professional: 3,
  enterprise:   999,
}

export const TIER_PRICES: Record<string, number> = {
  basis:        700,
  professional: 1400,
  enterprise:   2100,
}
