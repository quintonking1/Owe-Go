import './Screen.css'

/**
 * The frame every screen sits in: full height on a phone, and a centered
 * 390px column on anything wider. Floating buttons position against it.
 */
export function Screen({ children }) {
  return (
    <div className="screen-backdrop">
      <div className="screen">{children}</div>
    </div>
  )
}
