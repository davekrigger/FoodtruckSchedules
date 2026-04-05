export default function SearchBar({ filters, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <input
        type="text"
        placeholder="Search by truck name..."
        value={filters.name}
        onChange={e => onChange({ ...filters, name: e.target.value })}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', flex: 1, minWidth: '200px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <input
        type="text"
        placeholder="Cuisine type..."
        value={filters.cuisine}
        onChange={e => onChange({ ...filters, cuisine: e.target.value })}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', flex: 1, minWidth: '150px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <input
        type="date"
        value={filters.date}
        onChange={e => onChange({ ...filters, date: e.target.value })}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
      />
    </div>
  )
}
