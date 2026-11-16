import './ProgressSteps.css'

/**
 * A thin bar split into steps, with the finished ones filled in.
 *
 * Props:
 * - current: the step the user is on, counting from 1
 * - total: how many steps there are (default 3)
 */
export function ProgressSteps({ current, total = 3 }) {
  const steps = Array.from({ length: total }, (_, index) => index + 1)

  return (
    <div
      className="progress-steps"
      role="progressbar"
      aria-label={`Step ${current} of ${total}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      {steps.map((step) => (
        <span
          key={step}
          className={`progress-steps__step ${step <= current ? 'progress-steps__step--done' : ''}`.trim()}
        />
      ))}
    </div>
  )
}
