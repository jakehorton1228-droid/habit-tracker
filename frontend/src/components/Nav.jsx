import { Link } from 'react-router-dom'
import './nav.css'

export default function Nav() {
  return (
    <nav className="site-nav">
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/habits">Habits</Link>
        </li>
        <li>
          <Link to="/goals">Goals</Link>
        </li>
      </ul>
    </nav>
  )
}
