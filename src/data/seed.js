import tokyoPhoto from '../assets/tokyo.webp'

/**
 * Demo data. There is no backend and no login: the app starts as Quinton,
 * on one trip, with three friends who already have accounts.
 *
 * Shapes:
 *   person  { id, name, color, phone, friend }
 *           color is an Avatar color name. `friend: false` means they have an
 *           account but only show up once invited by phone number.
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
    { id: 'quinton', name: 'Quinton', color: 'you', phone: '5105550100', friend: true },
    { id: 'arno', name: 'Arno', color: 'arno', phone: '5105550111', friend: true },
    { id: 'catherine', name: 'Catherine', color: 'catherine', phone: '5105550122', friend: true },
    { id: 'dinah', name: 'Dinah', color: 'dinah', phone: '5105550133', friend: true },
    { id: 'maya', name: 'Maya', color: 'you', phone: '5105550144', friend: true },
    // Has an account, but isn't a friend yet. Invite by phone to add them.
    { id: 'leo', name: 'Leo', color: 'arno', phone: '5105550155', friend: false },
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
    {
      id: 'lisbon-2026',
      name: 'Lisbon',
      destination: 'Lisbon, Portugal',
      startDate: '2026-06-12',
      endDate: '2026-06-18',
      homeCurrency: 'USD',
      travelerIds: ['quinton', 'arno', 'dinah'],
      photo: null,
    },
  ],
  expenses: [],
  // Settle-up payments marked paid:
  //   { id, tripId, fromId, toId, amount, method, date, createdAt }
  //   amount is in the trip's home-currency cents.
  payments: [],
}

/** The trip the demo expenses belong to. */
export const DEMO_TRIP_ID = 'tokyo-2026'

const tripId = DEMO_TRIP_ID
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
