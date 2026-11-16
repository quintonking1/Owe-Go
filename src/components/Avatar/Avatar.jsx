import './Avatar.css'

/**
 * A circle with a person's initial.
 *
 * Props:
 * - name: the person's name. The first letter is shown.
 * - color: 'you', 'arno', 'catherine' or 'dinah' (the person colors in tokens.css)
 * - size: 'sm' (36px), 'md' (40px), 'lg' (44px) or 'xl' (52px)
 *
 * The avatar is hidden from screen readers, so show or announce the
 * person's name next to it.
 */
export function Avatar({ name, color = 'dinah', size = 'md', className = '' }) {
  return (
    <span
      className={`avatar avatar--${size} avatar--${color} ${className}`.trim()}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

/**
 * Avatars overlapping in a row, each with a white ring.
 *
 * Props:
 * - people: a list of { id, name, color }. Add `initial` when the letter
 *   shouldn't come from the name (the current user is named "You" but shows "Q").
 * - size: same sizes as Avatar
 */
export function AvatarStack({ people, size = 'sm', className = '' }) {
  return (
    <span className={`avatar-stack ${className}`.trim()}>
      {people.map((person) => (
        <span key={person.id} className="avatar-stack__item">
          <Avatar name={person.initial ?? person.name} color={person.color} size={size} />
        </span>
      ))}
    </span>
  )
}
