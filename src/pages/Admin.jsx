import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [pendingVenues, setPendingVenues] = useState([])
  const [approvedVenues, setApprovedVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    checkAdmin()
  }, [user])

  async function checkAdmin() {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') {
      navigate('/')
      return
    }

    setIsAdmin(true)
    fetchVenues()
  }

  async function fetchVenues() {
    const { data: pending } = await supabase
      .from('venues')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })

    const { data: approved } = await supabase
      .from('venues')
      .select('*')
      .eq('approved', true)
      .order('name')

    setPendingVenues(pending || [])
    setApprovedVenues(approved || [])
    setLoading(false)
  }

  async function approveVenue(id) {
    await supabase.from('venues').update({ approved: true }).eq('id', id)
    fetchVenues()
  }

  async function rejectVenue(id) {
    await supabase.from('venues').delete().eq('id', id)
    fetchVenues()
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>
  if (!isAdmin) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Admin Panel</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem', color: '#b45309' }}>
          Pending Venues ({pendingVenues.length})
        </h2>

        {pendingVenues.length === 0 && (
          <p style={{ color: '#888' }}>No venues waiting for approval.</p>
        )}

        {pendingVenues.map(venue => (
          <div key={venue.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem', border: '1px solid #fcd34d', borderRadius: '8px',
            marginBottom: '0.75rem', backgroundColor: '#fffbeb'
          }}>
            <div>
              <strong>{venue.name}</strong>
              {venue.city && <span style={{ color: '#888', marginLeft: '0.5rem' }}>{venue.city}</span>}
              {venue.address && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#666' }}>{venue.address}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => approveVenue(venue.id)}
                style={{ padding: '0.4rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Approve
              </button>
              <button
                onClick={() => rejectVenue(venue.id)}
                style={{ padding: '0.4rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.5rem', color: '#065f46' }}>
          Approved Venues ({approvedVenues.length})
        </h2>

        {approvedVenues.length === 0 && (
          <p style={{ color: '#888' }}>No approved venues yet.</p>
        )}

        {approvedVenues.map(venue => (
          <div key={venue.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', border: '1px solid #d1fae5', borderRadius: '8px',
            marginBottom: '0.5rem', backgroundColor: '#f0fdf4'
          }}>
            <div>
              <strong>{venue.name}</strong>
              {venue.city && <span style={{ color: '#888', marginLeft: '0.5rem' }}>{venue.city}</span>}
            </div>
            <button
              onClick={() => rejectVenue(venue.id)}
              style={{ padding: '0.3rem 0.75rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Remove
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
