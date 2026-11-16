import { Route, Routes } from 'react-router-dom'
import { ComponentsPage } from './preview/ComponentsPage.jsx'
import { ComingSoon } from './screens/ComingSoon/ComingSoon.jsx'
import { TripHome } from './screens/TripHome/TripHome.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TripHome />} />
      <Route path="/components" element={<ComponentsPage />} />

      {/* Screens still to build. */}
      <Route path="/expenses" element={<ComingSoon title="Expenses" />} />
      <Route path="/expenses/new" element={<ComingSoon title="New expense" />} />
      <Route path="/balances" element={<ComingSoon title="Balances" />} />
      <Route path="/settle" element={<ComingSoon title="Settle up" />} />
      <Route path="/travelers" element={<ComingSoon title="Travelers" />} />
      <Route path="/trips" element={<ComingSoon title="Trips" />} />
      <Route path="/profile" element={<ComingSoon title="Profile" />} />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  )
}
