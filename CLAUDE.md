# Owe & Go

A React web app for groups traveling together. Travelers log shared expenses in any currency, see each expense converted to the trip's home currency, and settle up with the fewest payments.

## Read first

- `owe-and-go-build-brief.md`: the full V2 design handoff, covering screens, flows, states, tokens, logic rules and build order. Read it before building any UI.
- `design/`: the V2 screen files (`V2*.dc.html`) and `tokens.json`. Each screen is a 390×844 phone frame written as HTML with inline styles. Treat these as the visual spec.

## Stack

- React web app written in JavaScript (no TypeScript). JSX for screen content, plain JavaScript for behavior.
- Styling is plain CSS: one .css file per component, all values from the CSS custom properties in `src/styles/tokens.css` (generated from `design/tokens.json`). No Tailwind, no CSS-in-JS, no inline styles.
- No UI component library. All components, including sheets, menus and the calendar, are built in-house.
- Exchange rates come from the Frankfurter API, using historical rates for the day each expense was paid.
- Data lives in `localStorage`. There is no backend.
- The user is assumed to be logged in. Other travelers are added by phone number, and the demo uses friends who already have accounts.

<!-- Fill in your real commands -->
## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Team ownership

The team is four people, and each area has an owner. Keep changes inside the area you were asked to work on, and flag anything that crosses into another area.

1. Trip and member management
2. Expense form and currency conversion
3. Balance and settlement logic
4. Summary views and styling

## How to build from the designs

- Match look and layout to `design/`. Keep data and logic in the app code.
- Never copy numbers from the mocks. Compute every share, balance and total from stored expenses. The mock data doesn't reconcile across screens.
- Build shared components first (avatar, buttons, expense row, currency picker, person picker, tab bar, bottom sheet, calendar), then build one screen at a time.
- The five `V2AddExpense*` files are one component in different states. Don't build five screens.
- Check each screen at 390px wide against its design file before moving on.
- Use only the Version 2 screens. Ignore any Version 1 files if an export includes them.

## Rules that must hold

- **Money:** store amounts in integer cents. Store the original amount, original currency, rate and rate date with every expense.
- **Conversion:** use the rate from the day the expense was paid, never today's rate.
- **Splits:** equal split among selected travelers. Give any leftover cent to the payer so totals stay exact.
- **Balances:** net = paid minus share. Nets across the group must sum to $0.00.
- **Settle up:** simplify debts to the fewest payments.
- **Dates:** expense dates can't be in the future.
- **Rates down:** if Frankfurter fails, show the "Rates unavailable" state with Retry and disable Save. Never save an expense without a rate.

## Design decisions to keep

- Your balance is shown in neutral black, never red.
- The paid and home currency amounts sit side by side at equal weight.
- The "Each pays" amount is 24px semibold DM Mono, and "Waiting on rate" matches it.
- Long lists scroll and fade out before the floating Add expense button.
- The settle breakdown ("How we got $X") starts collapsed.

## Accessibility

- Use real `<button>`, `<a>` and `<label>` elements. No click handlers on divs.
- Put `aria-label` on icon-only buttons, and `aria-expanded` on toggles and menus.
- Touch targets are at least 44px, and text contrast is at least 4.5:1.
