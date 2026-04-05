import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [trucks, setTrucks] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  // Add truck form
  const [showTruckForm, setShowTruckForm] = useState(false)
  const [truckName, setTruckName] = useState('')
  const [truckCuisine, setTruckCuisine] = useState('')

  // Add schedule form
  const [scheduleForm, setScheduleForm] = useState(null) // truck id or null
  const [schedDate, setSchedDate] = useState('')
  const [schedStart, setSchedStart] = useState('')
  const [schedEnd, setSchedEnd] = useState('')
  const [schedVenue, setSchedVenue] = useState('')
  const [newVenueName, setNewVenueName] = useState('')
  const [addingNewVenue, setAddingNewVenue] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchTrucks()
    fetchVenues()
  }, [user])

  async function fetchTrucks() {
    const { data } = await supabase
      .from('trucks')
      .select(`id, name, cuisine, schedules (id, date, start_time, end_time, status, venues (id, name, city))`)
      .eq('owner_id', user.id)
      .order('name')
    setTrucks(data || [])
    setLoading(false)
  }

  async function fetchVenues() {
    const { data } = await supabase
      .from('venues')
      .select('id, name, city')
      .eq('approved', true)
      .order('name')
    setVenues(data || [])
  }

  async function addTruck(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('trucks').insert({
      name: truckName,
      cuisine: truckCuisine,
      owner_id: user.id
    })
    if (error) { setError(error.message); return }
    setTruckName('')
    setTruckCuisine('')
    setShowTruckForm(false)
    fetchTrucks()
  }

  async function addSchedule(e) {
    e.preventDefault()
    setError('')

    let venueId = schedVenue

    if (addingNewVenue) {
      const { data, error } = await supabase
        .from('venues')
        .insert({ name: newVenueName, approved: false })
        .select()
        .single()
      if (error) { setError(error.message); return }
      venueId = data.id
    }

    const { error } = await supabase.from('schedules').insert({
      truck_id: scheduleForm,
      venue_id: venueId,
      date: schedDate,
      start_time: schedStart,
      end_time: schedEnd,
      status: 'active'
    })

    if (error) { setError(error.message); return }

    setScheduleForm(null)
    setSchedDate(''); setSchedStart(''); setSchedEnd(''); setSchedVenue(''); setNewVenueName('')
    setAddingNewVenue(false)
    fetchTrucks()
  }

  async function cancelSchedule(scheduleId) {
    await supabase.from('schedules').update({ status: 'cancelled' }).eq('id', scheduleId)
    fetchTrucks()
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Food Trucks</h1>
        <button
          onClick={() => setShowTruckForm(!showTruckForm)}
          style={{ padding: '0.5rem 1.25rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          + Add Truck
        </button>
      </div>

      {showTruckForm && (
        <form onSubmit={addTruck} style={{ backgroundColor: '#f9f9f9', padding: '1.25rem', borderRadius: '10px', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Truck name"
            value={truckName}
            onChange={e => setTruckName(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1, minWidth: '150px' }}
          />
          <input
            placeholder="Cuisine type"
            value={truckCuisine}
            onChange={e => setTruckCuisine(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1, minWidth: '150px' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Save Truck
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {trucks.length === 0 && !showTruckForm && (
        <p style={{ color: '#888' }}>No trucks yet. Click "+ Add Truck" to get started.</p>
      )}

      {trucks.map(truck => (
        <div key={truck.id} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{truck.name}</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.9rem' }}>{truck.cuisine}</p>
            </div>
            <button
              onClick={() => setScheduleForm(scheduleForm === truck.id ? null : truck.id)}
              style={{ padding: '0.4rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              + Add Schedule
            </button>
          </div>

          {scheduleForm === truck.id && (
            <form onSubmit={addSchedule} style={{ marginTop: '1rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }} />
                <input type="time" value={schedStart} onChange={e => setSchedStart(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }} />
                <input type="time" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }} />
              </div>

              {!addingNewVenue ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <select value={schedVenue} onChange={e => setSchedVenue(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}>
                    <option value="">Select a venue...</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name}{v.city ? `, ${v.city}` : ''}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setAddingNewVenue(true)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    + New venue
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    placeholder="Venue name (will be reviewed by admin)"
                    value={newVenueName}
                    onChange={e => setNewVenueName(e.target.value)}
                    required
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
                  />
                  <button type="button" onClick={() => setAddingNewVenue(false)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>
                    Cancel
                  </button>
                </div>
              )}

              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                Save Schedule
              </button>
            </form>
          )}

          <div style={{ marginTop: '1rem' }}>
            {(truck.schedules || []).filter(s => s.status === 'active').length === 0 && (
              <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>No upcoming schedules.</p>
            )}
            {(truck.schedules || [])
              .filter(s => s.status === 'active')
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: '6px', padding: '0.5rem 0.75rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <span>
                    <strong>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                    {' · '}{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                    {' · '}{s.venues?.name}{s.venues?.city ? `, ${s.venues.city}` : ''}
                  </span>
                  <button
                    onClick={() => cancelSchedule(s.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
