import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createDeck, shuffleDeck, dealPyramid } from '../shared/deck';
import { MatchState, Player, PyramidCard, Card } from '../shared/types';

const server = http.createServer();
const wss = new WebSocketServer({ server });

interface ClientMeta {
  id: string;
  room?: string;
  playerId?: string;
}

interface GameRoom {
  matchState: MatchState;
  clients: Set<WebSocket>;
}

const clients = new Map<WebSocket, ClientMeta>();
const rooms = new Map<string, GameRoom>();

// Game state management
function createMatch(roomCode: string, hostId: string): MatchState {
  const deck = createDeck();
  const shuffledDeck = shuffleDeck(deck, `seed-${roomCode}-${Date.now()}`);
  const [remainingDeck, pyramidCards] = dealPyramid(shuffledDeck, 5);
  
  // Convert pyramid cards to PyramidCard format with row/col positions
  const pyramid: PyramidCard[][] = [];
  for (let row = 0; row < pyramidCards.length; row++) {
    pyramid[row] = [];
    for (let col = 0; col < pyramidCards[row].length; col++) {
      const card = pyramidCards[row][col];
      if (card) {
        pyramid[row][col] = {
          ...card,
          row,
          col
        };
      }
    }
  }

  return {
    roomCode,
    hostId,
    rules: {
      stacking: true,
      busPenalty: 1,
      aceHigh: true
    },
    players: {},
    deck: remainingDeck,
    discard: [],
    phase: 'PYRAMID',
    pyramid,
    currentTurn: 0,
    rngSeed: `seed-${roomCode}-${Date.now()}`
  };
}

function addPlayerToMatch(matchState: MatchState, playerId: string, playerName: string): void {
  matchState.players[playerId] = {
    id: playerId,
    name: playerName,
    connected: true,
    hand: [],
    sipsGiven: 0,
    sipsReceived: 0
  };
}

function playCard(matchState: MatchState, playerId: string, cardId: string): boolean {
  const player = matchState.players[playerId];
  if (!player) return false;

  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return false;

  const card = player.hand[cardIndex];
  
  // Remove card from player's hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  matchState.discard.push(card);
  
  // Move to next turn
  const playerIds = Object.keys(matchState.players);
  const currentPlayerIndex = playerIds.indexOf(playerId);
  matchState.currentTurn = (currentPlayerIndex + 1) % playerIds.length;
  
  return true;
}

function broadcastToRoom(roomCode: string, message: any): void {
  const room = rooms.get(roomCode);
  if (room) {
    const messageStr = JSON.stringify(message);
    room.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

wss.on('connection', (ws) => {
  const meta: ClientMeta = { id: uuidv4() };
  clients.set(ws, meta);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'JOIN_ROOM':
          const { roomCode, playerId, playerName } = message;
          meta.room = roomCode;
          meta.playerId = playerId;
          
          let room = rooms.get(roomCode);
          if (!room) {
            // Create new room
            const matchState = createMatch(roomCode, playerId);
            addPlayerToMatch(matchState, playerId, playerName);
            room = { matchState, clients: new Set() };
            rooms.set(roomCode, room);
          } else {
            // Join existing room
            addPlayerToMatch(room.matchState, playerId, playerName);
          }
          
          room.clients.add(ws);
          
          // Send current match state to the joining player
          ws.send(JSON.stringify({
            type: 'MATCH_STATE',
            matchState: room.matchState
          }));
          
          // Broadcast updated state to all players
          broadcastToRoom(roomCode, {
            type: 'MATCH_STATE',
            matchState: room.matchState
          });
          break;
          
        case 'PLAY_CARD':
          const { cardId } = message;
          if (meta.room && meta.playerId) {
            const room = rooms.get(meta.room);
            if (room && playCard(room.matchState, meta.playerId, cardId)) {
              broadcastToRoom(meta.room, {
                type: 'MATCH_STATE',
                matchState: room.matchState
              });
            }
          }
          break;
          
        default:
          console.log(`[message] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (meta.room) {
      const room = rooms.get(meta.room);
      if (room) {
        room.clients.delete(ws);
        
        // Mark player as disconnected
        if (meta.playerId && room.matchState.players[meta.playerId]) {
          room.matchState.players[meta.playerId].connected = false;
        }
        
        // Remove room if empty
        if (room.clients.size === 0) {
          rooms.delete(meta.room);
        } else {
          // Broadcast updated state
          broadcastToRoom(meta.room, {
            type: 'MATCH_STATE',
            matchState: room.matchState
          });
        }
      }
    }
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Ride the Bus WS server running on port ${PORT}`);
});