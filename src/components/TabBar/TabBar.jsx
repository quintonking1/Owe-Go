import { NavLink } from 'react-router-dom'
import { Icon } from '../Icon/Icon.jsx'
import './TabBar.css'

const DEFAULT_TABS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/expenses', label: 'Expenses', icon: 'list' },
  { to: '/trips', label: 'Trips', icon: 'trips' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
]

/**
 * The bar of tabs along the bottom of the main screens.
 * The tab for the current page turns blue and is marked aria-current="page"
 * (NavLink adds that for us).
 *
 * Props: tabs, a list of { to, label, icon }. Defaults to the four app tabs.
 */
export function TabBar({ tabs = DEFAULT_TABS }) {
  return (
    <nav className="tab-bar" aria-label="Main">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `tab-bar__tab ${isActive ? 'tab-bar__tab--active' : ''}`.trim()}
        >
          <Icon name={tab.icon} size={24} strokeWidth={1.75} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
