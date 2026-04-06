import { Link } from 'react-router-dom'

export default function TruckCard({ truck, schedules, isFavorite, onToggleFavorite }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>
            <Link to={`/trucks/${truck.id}`} style={{ textDecoration: 'none', color: '#333' }}>
              {truck.name}
            </Link>
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.9rem' }}>{truck.cuisine}</p>
        </div>
        <button
          onClick={() => onToggleFavorite(truck.id)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: isFavorite ? '#ef4444' : '#ccc',
            padding: '0.25rem'
          }}
        >
          ♥
        </button>
      </div>

      {schedules && schedules.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {schedules.map(s => (
            <div key={s.id} style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <strong>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
              {' · '}
              {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
              {' · '}
              <Link to={`/venues/${s.venues?.id}`} style={{ color: '#555' }}>
                {s.venues?.name}
              </Link>
              {s.venues?.city && `, ${s.venues.city}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
