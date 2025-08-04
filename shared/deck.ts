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

/**
 * Builds a pyramid structure with the specified number of rows.
 * Returns an array of arrays where each inner array represents a row.
 * Example: [[card], [card, card], [card, card, card], ...]
 */
export function buildPyramid(rows: number = 5): Card[][] {
  const pyramid: Card[][] = [];
  for (let i = 0; i < rows; i++) {
    pyramid.push(new Array(i + 1).fill(null));
  }
  return pyramid;
}

/**
 * Deals cards from a shuffled deck to create a pyramid.
 * Returns a tuple of [remainingDeck, pyramid].
 */
export function dealPyramid(deck: Card[], rows: number = 5): [Card[], Card[][]] {
  const pyramid = buildPyramid(rows);
  const remainingDeck = deck.slice();
  
  // Calculate total cards needed for pyramid
  const totalCards = (rows * (rows + 1)) / 2;
  
  // Deal cards from the deck to fill the pyramid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      if (remainingDeck.length > 0) {
        pyramid[row][col] = remainingDeck.shift()!;
      }
    }
  }
  
  return [remainingDeck, pyramid];
}

/**
 * Returns the numeric value of a card rank.
 * A=14, K=13, Q=12, J=11, 10=10, 9=9, ..., 2=2
 */
export function rankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    'A': 14,
    'K': 13,
    'Q': 12,
    'J': 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
  };
  return values[rank];
}

/**
 * Compares two card ranks and returns -1, 0, or 1.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareRank(a: Rank, b: Rank): -1 | 0 | 1 {
  const valueA = rankValue(a);
  const valueB = rankValue(b);
  
  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
}