import { createDeck, shuffleDeck } from '../shared/deck';

describe('Deck utilities', () => {
  it('should create a deck of 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it('should produce deterministic shuffle with same seed', () => {
    const deck = createDeck();
    const shuffled1 = shuffleDeck(deck, 'seed123');
    const shuffled2 = shuffleDeck(deck, 'seed123');
    expect(shuffled1.map((c) => c.id)).toEqual(shuffled2.map((c) => c.id));
  });

  it('should produce different order with different seeds', () => {
    const deck = createDeck();
    const shuffled1 = shuffleDeck(deck, 'seedA');
    const shuffled2 = shuffleDeck(deck, 'seedB');
    expect(shuffled1.map((c) => c.id)).not.toEqual(shuffled2.map((c) => c.id));
  });
});