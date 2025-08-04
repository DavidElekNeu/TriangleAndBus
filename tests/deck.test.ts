import { createDeck, shuffleDeck, buildPyramid, dealPyramid, rankValue, compareRank } from '../shared/deck';

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

describe('Pyramid utilities', () => {
  describe('buildPyramid', () => {
    it('should build a pyramid with 5 rows by default', () => {
      const pyramid = buildPyramid();
      expect(pyramid).toHaveLength(5);
      expect(pyramid[0]).toHaveLength(1); // top row
      expect(pyramid[1]).toHaveLength(2);
      expect(pyramid[2]).toHaveLength(3);
      expect(pyramid[3]).toHaveLength(4);
      expect(pyramid[4]).toHaveLength(5); // bottom row
    });

    it('should build a pyramid with custom number of rows', () => {
      const pyramid = buildPyramid(3);
      expect(pyramid).toHaveLength(3);
      expect(pyramid[0]).toHaveLength(1);
      expect(pyramid[1]).toHaveLength(2);
      expect(pyramid[2]).toHaveLength(3);
    });

    it('should initialize all positions with null', () => {
      const pyramid = buildPyramid(2);
      expect(pyramid[0][0]).toBeNull();
      expect(pyramid[1][0]).toBeNull();
      expect(pyramid[1][1]).toBeNull();
    });
  });

  describe('dealPyramid', () => {
    it('should deal cards to create a 5-row pyramid', () => {
      const deck = createDeck();
      const [remainingDeck, pyramid] = dealPyramid(deck, 5);
      
      // Check pyramid structure
      expect(pyramid).toHaveLength(5);
      expect(pyramid[0]).toHaveLength(1);
      expect(pyramid[1]).toHaveLength(2);
      expect(pyramid[2]).toHaveLength(3);
      expect(pyramid[3]).toHaveLength(4);
      expect(pyramid[4]).toHaveLength(5);
      
      // Check that all positions are filled with cards
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
          expect(pyramid[row][col]).toBeDefined();
          expect(pyramid[row][col]).toHaveProperty('id');
          expect(pyramid[row][col]).toHaveProperty('rank');
          expect(pyramid[row][col]).toHaveProperty('suit');
        }
      }
      
      // Check deck size reduction (15 cards used for 5-row pyramid)
      expect(remainingDeck).toHaveLength(37); // 52 - 15 = 37
    });

    it('should deal cards to create a 3-row pyramid', () => {
      const deck = createDeck();
      const [remainingDeck, pyramid] = dealPyramid(deck, 3);
      
      expect(pyramid).toHaveLength(3);
      expect(pyramid[0]).toHaveLength(1);
      expect(pyramid[1]).toHaveLength(2);
      expect(pyramid[2]).toHaveLength(3);
      
      // 6 cards used for 3-row pyramid (1+2+3)
      expect(remainingDeck).toHaveLength(46); // 52 - 6 = 46
    });

    it('should handle insufficient cards gracefully', () => {
      const smallDeck = createDeck().slice(0, 10); // Only 10 cards
      const [remainingDeck, pyramid] = dealPyramid(smallDeck, 5);
      
      // Should still create the structure but not all positions filled
      expect(pyramid).toHaveLength(5);
      expect(remainingDeck).toHaveLength(0); // All cards used
    });

    it('should not modify the original deck', () => {
      const originalDeck = createDeck();
      const deckCopy = originalDeck.slice();
      dealPyramid(deckCopy, 5);
      
      expect(originalDeck).toHaveLength(52);
      expect(originalDeck.map(c => c.id)).toEqual(createDeck().map(c => c.id));
    });
  });
});

describe('Rank utilities', () => {
  describe('rankValue', () => {
    it('should return correct numeric values for all ranks', () => {
      expect(rankValue('A')).toBe(14);
      expect(rankValue('K')).toBe(13);
      expect(rankValue('Q')).toBe(12);
      expect(rankValue('J')).toBe(11);
      expect(rankValue('10')).toBe(10);
      expect(rankValue('9')).toBe(9);
      expect(rankValue('8')).toBe(8);
      expect(rankValue('7')).toBe(7);
      expect(rankValue('6')).toBe(6);
      expect(rankValue('5')).toBe(5);
      expect(rankValue('4')).toBe(4);
      expect(rankValue('3')).toBe(3);
      expect(rankValue('2')).toBe(2);
    });
  });

  describe('compareRank', () => {
    it('should return -1 when first rank is lower', () => {
      expect(compareRank('2', 'A')).toBe(-1);
      expect(compareRank('5', 'K')).toBe(-1);
      expect(compareRank('10', 'Q')).toBe(-1);
      expect(compareRank('J', 'A')).toBe(-1);
    });

    it('should return 1 when first rank is higher', () => {
      expect(compareRank('A', '2')).toBe(1);
      expect(compareRank('K', '5')).toBe(1);
      expect(compareRank('Q', '10')).toBe(1);
      expect(compareRank('A', 'J')).toBe(1);
    });

    it('should return 0 when ranks are equal', () => {
      expect(compareRank('A', 'A')).toBe(0);
      expect(compareRank('K', 'K')).toBe(0);
      expect(compareRank('5', '5')).toBe(0);
      expect(compareRank('2', '2')).toBe(0);
    });

    it('should handle all rank combinations correctly', () => {
      const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
      
      for (let i = 0; i < ranks.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
          const result = compareRank(ranks[i] as any, ranks[j] as any);
          
          if (i < j) {
            // ranks[i] has higher value than ranks[j] (A > K > Q > ... > 2)
            expect(result).toBe(1);
          } else if (i > j) {
            // ranks[i] has lower value than ranks[j]
            expect(result).toBe(-1);
          } else {
            expect(result).toBe(0);
          }
        }
      }
    });
  });
});