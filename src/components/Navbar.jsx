import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}>
        Food Truck Schedules
      </Link>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  )
}
