# PROPOSAL: Owe & Go

## Team

**Team name:** The Royals

**Members:**

- Quinton King
- Arno Demarteau
- Dinah Lee
- Catherine Grace McQueen

## Our Idea

Owe & Go is a React web app that helps groups traveling together keep track of shared costs and settle up fairly, no matter what currency each purchase was made in. Users create a trip, add the people on it, and log each expense with an amount, a currency, who paid, and who it should be split between. The app converts every expense into the group's home currency using the exchange rate from the day of the purchase, then calculates running balances and a simplified "who owes whom" summary so the group can settle with the fewest possible payments. For example, a user can log a ¥12,000 dinner in Tokyo paid by one person and split four ways, and every member's balance immediately updates in US dollars. Trips, members, and expenses are saved in the browser with localStorage, so a group's data is still there when they reopen the app later in the trip. We chose this idea because splitting costs on international trips is a real, common headache for students, and the project gives each team member a clear area to own: trip and member management, the expense form and currency conversion, the balance and settlement logic, and the summary views and styling.

## External API

We plan to use the **Frankfurter API** (https://frankfurter.dev), a free, open source API for current and historical exchange rates based on reference rates published by the European Central Bank and other central banks.

We chose it because:

- **No API key or sign up is required**, so every team member can start building right away and nothing sensitive needs to be stored in our public repository.
- **It supports historical rates by date**, which lets us convert each expense using the rate from the day it happened instead of today's rate, making balances more accurate.
- **It returns simple JSON** for the latest rates, a specific date, and a chosen base currency, which fits naturally with `fetch` and React state.
- **It covers the major currencies** travelers are most likely to use (USD, EUR, JPY, GBP, MXN, CAD, and more), which is enough for our use case.