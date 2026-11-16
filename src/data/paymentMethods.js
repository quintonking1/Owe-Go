/**
 * Ways a payment can be marked as paid. There's no payment backend: this only
 * records how the group says they paid each other.
 * `tag` is the short code shown in the mono chip.
 */
export const PAYMENT_METHODS = [
  { id: 'venmo', name: 'Venmo', tag: 'VEN' },
  { id: 'cash', name: 'Cash', tag: 'CSH' },
  { id: 'zelle', name: 'Zelle', tag: 'ZEL' },
  { id: 'paypal', name: 'PayPal', tag: 'PPL' },
  { id: 'other', name: 'Other', tag: 'OTH' },
]
