// Helper functions for parsing JSON fields from SQLite storage

export function parseProfile(profile: any) {
  if (!profile) return profile
  
  return {
    ...profile,
    services: profile.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : null,
    rates: profile.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : null,
    availability: profile.availability ? (typeof profile.availability === 'string' ? JSON.parse(profile.availability) : profile.availability) : null,
  }
}

export function parseProfiles(profiles: any[]) {
  return profiles.map(parseProfile)
}

