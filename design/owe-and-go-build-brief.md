# Owe & Go: V2 Build Brief

Handoff for building the Version 2 designs in the existing Owe & Go React app.

- **Design source:** "Owe & Go: Core Workflows" canvas, page "Version 2": https://claude.ai/artifact/Rr6HqWAa3gwxcW2WoVVYkr
- **Screen files:** `project/V2*.dc.html`, each one a 390×844 phone screen written as HTML with inline styles. Read them for exact spacing, sizes and colors.
- **Tokens:** `project/ds/owe-and-go/tokens.json`

## Ground rules

1. The designs are the spec for **look and layout**. The existing app is the source of truth for **data and logic** (expense storage, Frankfurter API rate lookups).
2. Never copy hardcoded numbers from the mocks. Compute every balance, share and total from real expenses. The mock data does not fully reconcile across screens (see "Known mock data issues").
3. Build shared components first, then screens one at a time. Check each screen against its design file before moving on.
4. Mobile first at 390px wide. Touch targets are at least 44px.

## Design tokens (quick reference)

Read `tokens.json` for the full set. The values used most:

| Role | Value |
|---|---|
| Text / primary dark | `#141414` |
| Background | `#FFFFFF` |
| Secondary text | `#565049` |
| Placeholder text | `#8A837B` |
| Borders / dividers | `#E4E1DB` |
| Subtle fill (chips, list icons, selected rows) | `#F6F4EF` |
| Accent (primary buttons, active tab, selection) | `#2948FF` |
| Positive ("is owed") | `#0F7A43` |
| Error | `#D7263D` |
| Card shadow | `0 6px 20px rgba(20,20,20,0.10)` |

- **Fonts:** DM Sans (UI text, weights 400 to 800) and DM Mono (all money amounts and currency codes, `font-variant-numeric: tabular-nums`). Both come from Google Fonts.
- **Radii:** 12px buttons, 16px cards and grouped fields, 999px pills and avatars, 24px top corners on bottom sheets.
- **Person colors:** You `#2948FF` with white text, Arno `#FFD43B`, Catherine `#FF7A59`, Dinah `#F6F4EF`, all with `#141414` text.

## Shared components

Build these before any screen:

- **Avatar**: circle with initial, sizes 36 / 40 / 44 / 52. Overlapping stack variant (−10px offset, 2px white ring).
- **Button**: primary (blue), dark (`#141414`), outline (1px dark border), text link (underlined, 3px offset). Height 44 or 48.
- **Icon button**: 36px circle with 1px border (back arrow, close X).
- **Screen header**: 44px top inset, then back or close button plus title.
- **Expense row**: currency chip (JPY / EUR), title, meta line ("Nov 5 · Arno paid · split 4"), USD amount with original currency underneath.
- **Currency chip / picker**: pill button with chevron that opens a listbox of currencies.
- **Person picker**: row of avatars with a selected ring and check badge (used for "Paid by" and "Split equally between").
- **Bottom tab bar**: Home, Expenses, Trips, Profile. Active tab in accent blue.
- **Floating "Add expense" button**: dark pill fixed above the tab bar.
- **Bottom sheet**: dimmed backdrop, rounded top, grab handle.
- **Calendar**: month grid used in single-date and date-range modes.
- **Inline error**: red icon plus 13px message under a field.

## Screens and flows

### Trip creation
| File | Screen | Notes |
|---|---|---|
| `V2Trips.dc.html` | Trips tab | Current trip card (photo, dates, traveler count, your balance) and past trips list. "+" starts a new trip. |
| `V2NewTrip.dc.html` | New trip step 1 | Destination search, trip name, dates, home currency. Progress bar 1 of 3. Close X returns to Trips. |
| `V2NewTripCalendar.dc.html` | Step 1 with date range sheet | Range selection with a shaded band between start and end. |
| `V2NewTripErrors.dc.html` | Step 1 validation | Shows errors only after tapping Next with missing fields. |
| `V2Travelers.dc.html` | Step 2, "Who is coming?" | Friend search, toggle travelers, invite by phone. "Create trip" goes to the empty trip. |

### Trip home and expenses
| File | Screen | Notes |
|---|---|---|
| `V2TripEmpty.dc.html` | Home, no expenses | Trip photo with traveler avatars over it, "Add first expense" CTA. |
| `V2TripHome.dc.html` | Home | Balance card plus a scrollable "Recent charges" list that fades out before the Add expense button. |
| `V2TripExpenses.dc.html` | Expenses tab | Full log grouped by date, with trip total. Same fade treatment. |

### Add expense (one component, several states)
`V2AddExpense`, `V2AddExpenseMenu`, `V2AddExpenseCalendar`, `V2AddExpenseError` and `V2AddExpenseErrors` are **one screen** in different states. Build one component.

- **Amount row:** paid currency (picker) and home currency (USD) side by side, both large DM Mono, with the rate line under them ("1 JPY = 0.0067 USD · Nov 5 rate").
- **Fields:** "What for" and Date in one grouped box. Date opens a single-date calendar sheet.
- **Paid by:** one person. **Split equally between:** any subset, with a Select all / Clear toggle.
- **Footer:** "Each pays (n)" label with the per-person amount at 24px semibold DM Mono, plus Save.
- **States:**
  - Currency menu open (`Menu`).
  - Date picker open (`Calendar`).
  - Rates unavailable (`Error`): rate service down, USD shows "$ ——", footer shows "Waiting on rate" at the same 24px size, Save is disabled at 40% opacity, Retry link in the alert.
  - Validation (`Errors`): amount must be above 0, name required, at least one person in the split. Errors show only after a Save attempt.

### Balances and settling
| File | Screen | Notes |
|---|---|---|
| `V2Balances.dc.html` | Balances | Each person's paid total, original currencies and net (+ is owed, − owes). Nets must add up to $0.00. |
| `V2Settle.dc.html` | Settle up | Suggested payments. Your payment card has a collapsed "How we got $X" toggle that expands to show your share of each expense, the math and a note on why it's one payment. |
| `V2ConfirmPay.dc.html` | Confirm payment sheet | Method and date, then "Mark paid". |
| `V2Settled.dc.html` | All settled | Every payment struck through with a Paid badge, plus "Undo last payment". |

## Logic rules

- **Conversion:** every expense converts to the trip's home currency using the rate **from the day it was paid** (Frankfurter historical rates). Store the original amount, original currency, rate and rate date with each expense.
- **Split:** equal split among selected people. Round to cents and give any leftover cent to the payer so totals stay exact.
- **Net balance** per person = what they paid minus the sum of their shares.
- **Settle up:** simplify debts so the group needs the fewest payments (greedy match of largest debtor to largest creditor works for small groups).
- **Breakdown:** "How we got $X" = your share of all expenses minus what you already paid. The line items must come from the real expense log.
- **Dates:** future dates are disabled in the expense date picker. The date defaults to today.

## Design decisions to keep

These came out of design review, so don't revert them:

- Your balance on Home is **neutral black** (`#141414`) with a gray arrow, never red. Owing friends is normal and red reads as an alarm.
- Paid and home currency amounts sit **side by side** at equal weight.
- The "Each pays" amount is prominent (24px semibold), and the "Waiting on rate" placeholder matches that size.
- Recent charges and the Expenses list scroll, and fade out before the floating Add expense button.
- Travelers appear over the trip photo to save space.
- The settle breakdown starts **collapsed**.
- Screens with a close X or back arrow share the same 44px top inset and title spacing.

## Known mock data issues

- The mocks use placeholder numbers that don't reconcile. Example: Sushi Dai ($187.60) plus Suica ($80.40) were both paid by You, which is $268.00, but Balances says You paid $224.50. Compute from real data and ignore the mock totals.
- The "8 more expenses" row in the Settle breakdown is a placeholder for the rest of the log.

## Suggested build order

1. Tokens as CSS variables (or a Tailwind theme) and font loading.
2. Shared components listed above.
3. Add expense (all states), since it carries the most logic.
4. Trip Home and Expenses.
5. Balances, Settle up, Confirm, Settled.
6. New trip flow and Trips tab.

## Done when

- Each screen matches its design file at 390px wide.
- All amounts come from computed data, and Balances nets sum to $0.00.
- Keyboard and screen reader basics work: real buttons and links, labels on inputs, `aria-label` on icon-only buttons, `aria-expanded` on toggles and menus.
