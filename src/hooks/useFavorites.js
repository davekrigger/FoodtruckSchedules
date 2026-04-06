import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (user) fetchFavorites()
    else setFavorites([])
  }, [user])

  async function fetchFavorites() {
    const { data } = await supabase
      .from('favorites')
      .select('id, truck_id, venue_id')
      .eq('user_id', user.id)
    setFavorites(data || [])
  }

  function isFavoriteTruck(truckId) {
    return favorites.some(f => f.truck_id === truckId)
  }

  async function toggleTruckFavorite(truckId) {
    if (!user) return false // caller should redirect to login

    const existing = favorites.find(f => f.truck_id === truckId)
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, truck_id: truckId })
    }
    fetchFavorites()
    return true
  }

  async function toggleVenueFavorite(venueId) {
    if (!user) return false

    const existing = favorites.find(f => f.venue_id === venueId)
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, venue_id: venueId })
    }
    fetchFavorites()
    return true
  }

  return { favorites, isFavoriteTruck, toggleTruckFavorite, toggleVenueFavorite }
}
