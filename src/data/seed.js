import tokyoPhoto from '../assets/tokyo.webp'

/**
 * Demo data. There is no backend and no login: the app starts as Quinton,
 * on one trip, with three friends who already have accounts.
 *
 * Shapes:
 *   person  { id, name, color }   color is an Avatar color name
 *   trip    { id, name, destination, startDate, endDate, homeCurrency, travelerIds, photo }
 *   expense { id, tripId, title, date, amount, currency, rate, rateDate,
 *             paidById, splitBetweenIds, createdAt }
 *           amount is in the paid currency's smallest unit (cents, or whole yen).
 *           rate and rateDate come from Frankfurter for the day it was paid.
 */
export const initialData = {
  currentUserId: 'quinton',
  currentTripId: 'tokyo-2026',
  // Becomes true once the demo expenses have been added.
  demoSeeded: false,
  people: [
    { id: 'quinton', name: 'Quinton', color: 'you' },
    { id: 'arno', name: 'Arno', color: 'arno' },
    { id: 'catherine', name: 'Catherine', color: 'catherine' },
    { id: 'dinah', name: 'Dinah', color: 'dinah' },
  ],
  trips: [
    {
      id: 'tokyo-2026',
      name: 'Tokyo 2026',
      destination: 'Tokyo, Japan',
      startDate: '2026-11-03',
      endDate: '2026-11-10',
      homeCurrency: 'USD',
      travelerIds: ['quinton', 'arno', 'catherine', 'dinah'],
      photo: tokyoPhoto,
    },
  ],
  expenses: [],
}

const tripId = 'tokyo-2026'
const everyone = ['quinton', 'arno', 'catherine', 'dinah']

/**
 * Demo expenses, without rates. Each one gets its rate from Frankfurter for
 * the day it was paid before it is saved (see demo.js).
 */
export const demoExpenseDrafts = [
  { tripId, title: 'Airport dinner', date: '2026-11-03', amount: 7250, currency: 'EUR', paidById: 'catherine', splitBetweenIds: ['catherine', 'dinah', 'quinton'] },
  { tripId, title: 'Suica top-ups', date: '2026-11-04', amount: 9000, currency: 'JPY', paidById: 'quinton', splitBetweenIds: everyone },
  { tripId, title: 'teamLab tickets', date: '2026-11-04', amount: 16800, currency: 'JPY', paidById: 'dinah', splitBetweenIds: everyone },
  { tripId, title: 'Ramen in Shinjuku', date: '2026-11-05', amount: 31500, currency: 'JPY', paidById: 'arno', splitBetweenIds: everyone },
  { tripId, title: 'Shibuya Sky tickets', date: '2026-11-06', amount: 13600, currency: 'JPY', paidById: 'arno', splitBetweenIds: everyone },
  { tripId, title: 'Sushi breakfast', date: '2026-11-06', amount: 24200, currency: 'JPY', paidById: 'quinton', splitBetweenIds: everyone },
  { tripId, title: 'Museum audio guides', date: '2026-11-07', amount: 4800, currency: 'USD', paidById: 'dinah', splitBetweenIds: ['dinah', 'arno'] },
  { tripId, title: 'Konbini snacks', date: '2026-11-08', amount: 7350, currency: 'JPY', paidById: 'catherine', splitBetweenIds: everyone },
]
