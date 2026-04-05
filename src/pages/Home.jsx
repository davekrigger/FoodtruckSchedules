import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import SearchBar from '../components/SearchBar'
import TruckCard from '../components/TruckCard'

export default function Home() {
  const [filters, setFilters] = useState({ name: '', cuisine: '', date: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTrucks()
  }, [filters])

  async function fetchTrucks() {
    setLoading(true)

    let query = supabase
      .from('trucks')
      .select(`
        id, name, cuisine,
        schedules (
          id, date, start_time, end_time, status,
          venues ( id, name, city )
        )
      `)

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters.cuisine) {
      query = query.ilike('cuisine', `%${filters.cuisine}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    let trucks = data || []

    // Filter by date and only show active schedules
    trucks = trucks.map(truck => ({
      ...truck,
      schedules: (truck.schedules || []).filter(s => {
        if (s.status !== 'active') return false
        if (filters.date && s.date !== filters.date) return false
        return true
      })
    }))

    // If filtering by date, only show trucks that have a schedule that day
    if (filters.date) {
      trucks = trucks.filter(t => t.schedules.length > 0)
    }

    setResults(trucks)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Find a Food Truck</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Search by name, cuisine, or date to find food trucks near you.
      </p>

      <SearchBar filters={filters} onChange={setFilters} />

      {loading && <p>Searching...</p>}

      {!loading && results.length === 0 && (
        <p style={{ color: '#888' }}>No food trucks found. Try a different search.</p>
      )}

      {results.map(truck => (
        <TruckCard key={truck.id} truck={truck} schedules={truck.schedules} />
      ))}
    </div>
  )
}
