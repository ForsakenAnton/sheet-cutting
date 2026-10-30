/**
 * The “Buy me a coffee” window (☕ in the navbar). Everything here ends up in the site's code,
 * so it is public: put only what you would post anyway — never the card's expiry date or CVV.
 * While there is neither a card nor a link, the button is hidden.
 */
export const DONATE: { card: string; links: ReadonlyArray<{ title: string; url: string }> } = {
  /** Card number, with or without spaces: '4441 1144 1234 5678'. */
  card: '',
  /**
   * Payment pages (a PUMB MoneyBox, a monobank jar, Ko-fi…): buttons that open in a new tab. The
   * title follows “Support via”, so it can name the service or how to pay there.
   */
  links: [{ title: 'Google Pay / Apple Pay', url: 'https://mobile-app.pumb.ua/1cOMs' }],
};

export const hasDonate = /\d/.test(DONATE.card) || DONATE.links.length > 0;
