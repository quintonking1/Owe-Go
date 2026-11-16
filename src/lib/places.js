/**
 * Place search from the Open-Meteo geocoding API
 * (https://open-meteo.com/en/docs/geocoding-api). It's free, needs no key,
 * and finds cities and countries worldwide. Only the search text is sent.
 */

const API = 'https://geocoding-api.open-meteo.com/v1/search'
const TIMEOUT_MS = 8000

/** Thrown when the search service can't be reached. */
export class PlaceSearchUnavailableError extends Error {
  constructor() {
    super('Could not reach the place search service.')
    this.name = 'PlaceSearchUnavailableError'
  }
}

/** Feature codes Open-Meteo uses for a whole country. */
const COUNTRY_CODES = new Set(['PCLI', 'PCLD', 'PCLF', 'PCLS', 'PCL', 'TERR'])

/**
 * Search for places matching `query`. Returns up to 6 results:
 *   { id, name, region, country, countryCode, isCountry, label }
 * `label` is what gets saved on the trip, e.g. "Tokyo, Japan" or "Japan".
 * Pass an AbortSignal to cancel a search the user has typed past.
 */
export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({ name: query, count: '6', language: 'en', format: 'json' })

  let data
  try {
    const response = await fetch(`${API}?${params}`, {
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new PlaceSearchUnavailableError()
    data = await response.json()
  } catch (error) {
    // A search the user typed past isn't a failure: let the caller ignore it.
    if (signal?.aborted) throw error
    throw new PlaceSearchUnavailableError()
  }

  return (data?.results ?? [])
    .filter((result) => result.name && result.country_code)
    .map((result) => {
      const isCountry = COUNTRY_CODES.has(result.feature_code)
      const country = result.country ?? result.name
      return {
        id: String(result.id),
        name: result.name,
        region: isCountry ? '' : (result.admin1 ?? ''),
        country,
        countryCode: result.country_code,
        isCountry,
        label: isCountry || result.name === country ? result.name : `${result.name}, ${country}`,
      }
    })
}
