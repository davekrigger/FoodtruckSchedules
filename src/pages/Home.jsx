import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../hooks/useFavorites'
import SearchBar from '../components/SearchBar'
import TruckCard from '../components/TruckCard'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavoriteTruck, toggleTruckFavorite } = useFavorites()

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

    if (filters.name) query = query.ilike('name', `%${filters.name}%`)
    if (filters.cuisine) query = query.ilike('cuisine', `%${filters.cuisine}%`)

    const { data, error } = await query
    if (error) { console.error(error); setLoading(false); return }

    let trucks = (data || []).map(truck => ({
      ...truck,
      schedules: (truck.schedules || []).filter(s => {
        if (s.status !== 'active') return false
        if (filters.date && s.date !== filters.date) return false
        return true
      })
    }))

    if (filters.date) trucks = trucks.filter(t => t.schedules.length > 0)

    setResults(trucks)
    setLoading(false)
  }

  async function handleToggleFavorite(truckId) {
    if (!user) { navigate('/login'); return }
    await toggleTruckFavorite(truckId)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Find a Food Truck</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Search by name, cuisine, or date to find food trucks near you.
        {!user && <span> <a href="/login" style={{ color: '#4f46e5' }}>Log in</a> to save favorites.</span>}
      </p>

      <SearchBar filters={filters} onChange={setFilters} />

      {loading && <p>Searching...</p>}

      {!loading && results.length === 0 && (
        <p style={{ color: '#888' }}>No food trucks found. Try a different search.</p>
      )}

      {results.map(truck => (
        <TruckCard
          key={truck.id}
          truck={truck}
          schedules={truck.schedules}
          isFavorite={isFavoriteTruck(truck.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  )
}
