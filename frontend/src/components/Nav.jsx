import { NavLink } from 'react-router-dom'
import UserMenu from './UserMenu'

export default function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? 'text-white bg-gradient-to-r from-accent to-accent-2 shadow-lg shadow-accent/30'
        : 'text-muted hover:text-white hover:bg-accent-2/15'
    }`

  return (
    <nav className="flex items-center justify-between sticky top-0 z-50 px-6 py-3 border-b border-white/5 backdrop-blur-xl bg-gradient-to-r from-[rgba(26,16,37,0.95)] to-[rgba(15,10,24,0.98)]">
      <ul className="flex gap-2 list-none m-0 p-0 items-center">
        <li>
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/habits" className={linkClass}>Habits</NavLink>
        </li>
        <li>
          <NavLink to="/goals" className={linkClass}>Goals</NavLink>
        </li>
        <li>
          <NavLink to="/journal" className={linkClass}>Journal</NavLink>
        </li>
      </ul>
      <UserMenu />
    </nav>
  )
}
