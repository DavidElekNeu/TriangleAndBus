Ride the Bus (Hungarian “Buszozás”) — Mobile‑First, Online

A real‑time, phone‑friendly drinking card game with lobby/host support. Players join via a short room code. The game tracks “sips” throughout, supports quick restarts, and implements the classic pyramid phase followed by the “ride the bus” phase.
High‑level goals

    Mobile-first UI; playable on phones in portrait.

    Online play: one phone can host a room; others join via code/link.

    Authoritative deck & fairness: single source of truth for shuffles and moves.

    Zero friction: add players, start game, show clear prompts, one-tap “New Game”.

    Sip tracking until the end.

Game Rules (Authoritative)
Components

    1 standard 52‑card French deck (no jokers).

    N players (2+), each starts with 5 cards in hand.

Phase 1: Pyramid (“5–4–3–2–1”)

    Build a face‑down pyramid on the table:

        Row 1 (bottom): 5 cards

        Row 2: 4 cards

        Row 3: 3 cards

        Row 4: 2 cards

        Row 5 (top): 1 card

    Reveal cards row by row, left to right, starting from the bottom row (5) up to the top row (1).

    Matching rule: After a pyramid card is flipped, any player who has a card of the same rank/value (e.g., any 7 matches any 7) may immediately play one or more matching cards from their hand.

    Sip assignment per row (weight = sips to assign for each matching card played):

        Row with 5 cards → 1 sip

        Row with 4 cards → 2 sips

        Row with 3 cards → 3 sips

        Row with 2 cards → 4 sips

        Row with 1 card → 5 sips

    Distribution: A player who plays a matching card may assign the row’s sips to one person or split as 1‑sip units among multiple people (e.g., 5 sips to one person, or 5×1 to five different people).

    Hand management: No drawing during the pyramid. Once you play a card, it leaves your hand.

    Simultaneity: If multiple players attempt to play at once, resolve by earliest claim timestamp (server‑side). Optionally allow stacking (several players can play if they all have the same rank) — enabled by default.

    End of Phase 1: When the entire pyramid is revealed, the player(s) with the most cards remaining in hand must ride the bus. If there’s a tie, all tied players ride the bus one after another.

Phase 2: Ride the Bus

    For the current bus rider, deal a row of 5 cards in front of them: 4 face‑up (showing rank/suit), 1 face‑down (the last position).

    The rider must, for each position in order (1→5), guess whether the next drawn card from the deck will be Higher or Lower than the visible card at that position.

        Aces high (A > K). Equal ranks count as incorrect.

    Reveal the next card from the deck to check the guess:

        Correct → advance to the next position.

        Wrong → the rider drinks (default 1 sip per mistake, configurable), and the bus resets:

            Discard the row, deal 5 new cards (4 up, 1 down), and the rider must start again from position 1.

    The rider finishes when they guess all 5 positions in a single continuous run. Then the next tied rider (if any) rides.

    Game ends when all required riders finish. Show final sip totals and a “New Game” button (preserving players & rules).

Configurable options (with sensible defaults)

    Stacking in Pyramid: multiple players can play on the same flip (default: on).

    Bus penalty per wrong guess: default 1 sip; allow 1–5.

    Ace handling: default A high; (option: A low).

    Tie policy for riders: default all tied ride (sequential).

    Simultaneous claim window: 2–3 seconds per flip to avoid network jitter issues.

UX Flow (Mobile‑first)

    Home / Create or Join

        Create Room → shows room code and share link.

        Join Room → enter code.

    Lobby

        Add name, pick emoji/color avatar.

        Host selects rules (stacking on/off, bus penalty).

        Start Game.

    Pyramid

        Big “Flip” button for host (or auto‑flip with a timer).

        After each flip: show the revealed card.

        Players tap “Play Match” (if they have that rank), then assign sips via quick chips (e.g., +1) to one or multiple names, until the row’s sip quota per played card is exhausted.

        Show live Sips Given / Received and Cards Left per player.

    Bus

        For the rider: show 5 card row (4 up + 1 down), large Higher / Lower buttons.

        On wrong guess: flash feedback, add penalty sip(s), reset row.

        Progress bar: “2/5 correct” etc.

    Results

        Totals, highlights, “New Game” (keeps players), “Change Rules”, “Leave”.

Architecture (suggested, but language‑agnostic)

    Client: SPA/PWA, responsive UI.

    Transport: WebSockets (or WebRTC data channels) for real‑time events.

    Server (can be the host’s device or a small backend):

        Authoritative state (deck, pyramid, hands, timers).

        Deterministic shuffle with seed (store in match log for audit/replay).

        Conflict resolution for simultaneous plays.

        Persistence optional (in‑memory per room is fine).

Repository structure (example)

/app
  /client              # mobile-first UI
  /server              # ws/websocket server
  /shared              # types, constants, validation
  README.md
  SPEC.md

Data Model (shared types)

// Card
type Suit = 'C'|'D'|'H'|'S';
type Rank = 'A'|'K'|'Q'|'J'|'10'|'9'|'8'|'7'|'6'|'5'|'4'|'3'|'2';
type Card = { id: string; rank: Rank; suit: Suit }; // id unique per deck card

// Player
type Player = {
  id: string;
  name: string;
  avatar?: string;
  connected: boolean;
  hand: Card[];
  sipsGiven: number;
  sipsReceived: number;
};

// Room / Match
type Rules = {
  stacking: boolean;        // default true
  busPenalty: number;       // default 1
  aceHigh: boolean;         // default true
};

type Phase = 'LOBBY'|'PYRAMID'|'BUS'|'RESULTS';

type Pyramid = {
  rows: Card[][];           // rows[0] = 5 cards (bottom), rows[4] = 1 card (top)
  revealed: boolean[][];    // same shape as rows
  currentRow: number;       // 0..4 (bottom..top)
  currentIndex: number;     // 0..(rowLen-1)
};

type BusState = {
  queue: string[];          // playerIds who must ride the bus (in order)
  currentRider?: string;
  row?: { visible: Card[]; hidden: Card }; // 4 up + 1 down
  position: number;         // 0..4 (index of guess to make)
};

type MatchState = {
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
};

Real‑time Protocol (WebSocket events)

Room & Lobby

    room:create → { roomCode }

    room:join → { roomCode, player: { name, avatar } } → ack with state

    room:leave → { playerId }

    room:state (broadcast full or diffed state)

Game control

    game:start → server deals (5 cards to each), builds pyramid, phase→PYRAMID

    game:new → reset with same players & rules

Pyramid

    pyramid:flip (host or auto) → reveal rows[row][idx], open claim window

    pyramid:claim → { playerId, matchRank, count } server validates hand

    pyramid:assign → { from: playerId, to: playerId, amount: number }

    On row end, advance indices; on pyramid end, compute bus queue (most cards left; ties included) and phase→BUS.

Bus

    bus:deal (server) → 4 up + 1 down

    bus:guess → { playerId, choice: 'HIGH'|'LOW' }

        Server draws next from deck, evaluates vs the current visible card at position

        On wrong: increment sipsReceived for rider by rules.busPenalty, reset with bus:deal

        On correct: position++; when position==5, rider done → next rider or RESULTS

Errors & Guards

    Server rejects out‑of‑phase actions, stale claims, or invalid hands.

    All decisions are server‑authoritative; client is optimistic but reconciles.

Turn & Timer Logic

    Pyramid flip cadence:

        Reveal → 2s claim window (configurable).

        During window: accept claim events; if stacking=off, only the earliest is honored.

        After window closes: apply sip assignments; auto‑advance to next card after e.g. 0.5s.

    Bus:

        No global timer required, but a 15–20s inactivity timeout can auto‑fail a guess (counts as a wrong guess and reset).

Fairness & Anti‑Cheat

    Server shuffles with a seeded RNG and logs rngSeed.

    All card movements occur server‑side; clients never generate deck order.

    Event timestamps resolved server‑side for simultaneous claims.

Edge Cases

    Disconnects: mark connected=false. If the current rider/claimant disconnects, host can skip them or the server auto‑skips after a timeout.

    Multiple riders (tie): process riders sequentially in bus.queue.

    Empty deck (rare): reshuffle discard (preserving order is not required) and continue.

    Equal rank on Bus: always treated as wrong.

Acceptance Criteria (must‑pass)

    A host can create a room on a phone and at least 1 other player can join via code.

    Starting the game deals 5 cards per player, builds a 5‑4‑3‑2‑1 pyramid.

    Flipping proceeds bottom row → top row, left → right.

    When a flip matches a player’s rank, they can play it and assign correct sip amounts (1/2/3/4/5 by row).

    At pyramid end, the player(s) with the most cards left become bus rider(s).

    Bus phase enforces Higher/Lower guesses, resets on wrong, finishes after 5 correct in a row.

    Sips tally increments appropriately in both phases and is visible per player.

    “New Game” reuses players & rules and starts a fresh shuffle.

    Works smoothly on mobile (tap targets ≥44px, no horizontal scroll).

Testing Notes

    Unit test the evaluator functions:

        deck creation & seeded shuffle

        pyramid reveal order

        claim resolution (stacking on/off)

        bus comparison (Ace high or low)

    Simulate race conditions: two pyramid:claim within 10ms.

    Snapshot tests for state transitions across a full match.

Optional Enhancements

    Room URL deep‑linking (/r/AB12CD), QR code share.

    Emoji reactions on flips.

    Local pass‑and‑play mode (no network).

    Internationalization (HU/EN toggle).

    Persistent profiles & match history.

License

MIT (or your preferred license).
Quick “Definition of Done” for a first release

    Host/Join works on real phones.

    Pyramid and Bus phases fully playable with sip tracking.

    Ties handled; multiple riders supported.

    One‑tap New Game with same lobby.

    Clear feedback on every action, and graceful disconnect handling.
