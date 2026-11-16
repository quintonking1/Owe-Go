import { Screen } from '../../components/Screen/Screen.jsx'
import { TabBar } from '../../components/TabBar/TabBar.jsx'
import { TopBar } from '../../components/TopBar/TopBar.jsx'
import './ComingSoon.css'

/** Stand-in for screens that aren't built yet, so links have somewhere to go. */
export function ComingSoon({ title }) {
  return (
    <Screen>
      <TopBar action="back" actionLabel="Back to home" to="/" title={title} />
      <main className="coming-soon">
        <h2 className="coming-soon__title">Not built yet</h2>
        <p className="coming-soon__text">This screen is coming in a later step.</p>
      </main>
      <TabBar />
    </Screen>
  )
}
