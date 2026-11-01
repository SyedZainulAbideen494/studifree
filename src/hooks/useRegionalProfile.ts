import { useEffect, useState } from 'react'
import {
  getRegionalProfile,
  LOCATION_PREFERENCE_CHANGED_EVENT,
  type RegionalProfile,
} from '../services/location'

/**
 * Reactive access to the coarse region the visitor allowed.
 * Returns null unless location personalisation is currently granted.
 */
export function useRegionalProfile(): RegionalProfile | null {
  const [profile, setProfile] = useState<RegionalProfile | null>(() => getRegionalProfile())

  useEffect(() => {
    const sync = () => setProfile(getRegionalProfile())
    window.addEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(LOCATION_PREFERENCE_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return profile
}
