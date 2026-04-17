import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useItems — fetches active listings and subscribes to realtime updates.
 * Items are filtered by: not sold, not expired.
 */
export function useItems(category = null, searchQuery = '') {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = async ({ withLoader = true } = {}) => {
    if (withLoader) {
      setLoading(true)
    }
    setError(null)

    let query = supabase
      .from('items')
      .select('*')
      .eq('is_sold', false)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems(data || [])
    }

    if (withLoader) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()

    // Subscribe to realtime changes on the items table
    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems({ withLoader: false })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items

    return items.filter(item => {
      const candidates = [item.title, item.description, item.seller_name, item.category]
      return candidates.some(value => typeof value === 'string' && value.toLowerCase().includes(normalizedSearch))
    })
  }, [items, normalizedSearch])

  return { items: filteredItems, loading, error, refetch: fetchItems }
}
