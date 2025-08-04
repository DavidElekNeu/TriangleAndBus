import seedrandom from 'seedrandom';
import { Card, Rank, Suit } from './types';

/**
 * Return a freshly ordered standard 52-card French deck.
 * Card IDs are generated as `<rank><suit>` where suit is one of C,D,H,S.
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const ranks: Rank[] = [
    'A',
    'K',
    'Q',
    'J',
    '10',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    '2',
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: `${rank}${suit}`, rank, suit });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle using a deterministic PRNG seeded with `seed`.
 * Returns a new array leaving the original deck untouched.
 */
export function shuffleDeck(deck: Card[], seed: string): Card[] {
  const rng = seedrandom(seed);
  const copy = deck.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}