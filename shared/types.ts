/*
  Shared domain model for Ride the Bus online card game.
  These types are imported by both server and client code to guarantee
  compile-time consistency of the real-time protocol.
*/
export type Suit = 'C' | 'D' | 'H' | 'S';
export type Rank =
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2';

export interface Card {
  /** Unique identifier – concatenation of rank + suit + deck index */
  id: string;
  rank: Rank;
  suit: Suit;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  connected: boolean;
  hand: Card[];
  sipsGiven: number;
  sipsReceived: number;
}

export interface Rules {
  stacking: boolean; // default true
  busPenalty: number; // default 1
  aceHigh: boolean; // default true
}

export type Phase = 'LOBBY' | 'PYRAMID' | 'BUS' | 'RESULTS';

export interface Pyramid {
  /** rows[0] = 5 cards (bottom), rows[4] = 1 card (top) */
  rows: Card[][];
  /** Mirror shape of `rows`; true means card at [row][index] has been revealed */
  revealed: boolean[][];
  /** 0-based index, bottom row = 0, top row = 4 */
  currentRow: number;
  /** 0-based index within currentRow */
  currentIndex: number;
}

export interface BusRow {
  visible: Card[]; // length 4
  hidden: Card; // last card in the row
}

export interface BusState {
  /** Player IDs in order who must ride */
  queue: string[];
  /** Player ID currently riding */
  currentRider?: string;
  row?: BusRow;
  /** 0..4 index of next guess */
  position: number;
}

export interface MatchState {
  roomCode: string;
  hostId: string;
  rules: Rules;
  players: Record<string, Player>;
  deck: Card[];
  discard: Card[];
  phase: Phase;
  pyramid?: Pyramid;
  bus?: BusState;
  rngSeed: string;
}