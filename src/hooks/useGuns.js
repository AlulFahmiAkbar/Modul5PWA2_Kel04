import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'

// ---------------------------------------------------------------------------
// useGuns — fetch the paginated / filtered product list from the API.
//
// Returns { guns, loading, error, pagination, refetch }.
// When the API is unreachable the `error` string will be set and `guns`
// will remain an empty array so the UI can show a proper error state.
// ---------------------------------------------------------------------------

// In-memory query cache with 5 minutes TTL
const queryCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

export function useGuns(params = {}, options = { enableCache: true }) {
  const [guns, setGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  // Serialise params so the effect re-runs when they change.
  const paramKey = JSON.stringify(params)

  const fetchGuns = useCallback(async (forceRefresh = false) => {
    // 1. Check in-memory query cache
    const cachedEntry = queryCache.get(paramKey)
    const isCacheValid = cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)

    if (options.enableCache && isCacheValid && !forceRefresh) {
      setGuns(cachedEntry.guns)
      setPagination(cachedEntry.pagination)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await gunService.getGuns(params)

      if (response.success) {
        const fetchedData = response.data || []
        const paginationData = response.pagination || null
        setGuns(fetchedData)
        setPagination(paginationData)

        if (options.enableCache) {
          queryCache.set(paramKey, {
            guns: fetchedData,
            pagination: paginationData,
            timestamp: Date.now(),
          })
        }
      } else {
        setError(response.message || 'Failed to fetch products.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching products.')
      setGuns([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, options.enableCache])

  useEffect(() => {
    fetchGuns()
  }, [fetchGuns])

  const refetch = useCallback(() => {
    queryCache.delete(paramKey)
    return fetchGuns(true)
  }, [paramKey, fetchGuns])

  return { guns, loading, error, pagination, refetch }
}

// ---------------------------------------------------------------------------
// useGunById — fetch a single product by its UUID.
//
// Returns { gun, loading, error, refetch }.
// ---------------------------------------------------------------------------

export function useGunById(id) {
  const [gun, setGun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGun = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await gunService.getGunById(id)

      if (response.success) {
        setGun(response.data)
      } else {
        setError(response.message || 'Product not found.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details.')
      setGun(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGun()
  }, [fetchGun])

  return { gun, loading, error, refetch: fetchGun }
}
