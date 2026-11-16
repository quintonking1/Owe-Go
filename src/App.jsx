import { Route, Routes } from 'react-router-dom'
import { ComponentsPage } from './preview/ComponentsPage.jsx'
import { AddExpense } from './screens/AddExpense/AddExpense.jsx'
import { ComingSoon } from './screens/ComingSoon/ComingSoon.jsx'
import { Expenses } from './screens/Expenses/Expenses.jsx'
import { NewTripDetails } from './screens/NewTrip/NewTripDetails.jsx'
import { NewTripFlow } from './screens/NewTrip/NewTripFlow.jsx'
import { NewTripTravelers } from './screens/NewTrip/NewTripTravelers.jsx'
import { TripHome } from './screens/TripHome/TripHome.jsx'
import { Trips } from './screens/Trips/Trips.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TripHome />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/expenses/new" element={<AddExpense />} />
      <Route path="/trips" element={<Trips />} />
      {/* New trip: both steps share one draft, held by NewTripFlow. */}
      <Route path="/trips/new" element={<NewTripFlow />}>
        <Route index element={<NewTripDetails />} />
        <Route path="travelers" element={<NewTripTravelers />} />
      </Route>
      <Route path="/components" element={<ComponentsPage />} />

      {/* Screens still to build. */}
      <Route path="/balances" element={<ComingSoon title="Balances" />} />
      <Route path="/settle" element={<ComingSoon title="Settle up" />} />
      <Route path="/travelers" element={<ComingSoon title="Travelers" />} />
      <Route path="/profile" element={<ComingSoon title="Profile" />} />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  )
}
