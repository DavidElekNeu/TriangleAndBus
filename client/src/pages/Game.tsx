import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { useState, useEffect } from 'react';
import { MatchState, PyramidCard } from '../../../shared/types';

export default function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { connected, send, socket } = useWebSocket();
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (connected && code) {
      // Join the room
      send({
        type: 'JOIN_ROOM',
        roomCode: code,
        playerId: `player-${Math.random().toString(36).substr(2, 9)}`,
        playerName: `Player ${Math.floor(Math.random() * 1000)}`
      });
    }
  }, [connected, code, send]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'MATCH_STATE') {
          setMatchState(message.matchState);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    if (socket) {
      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket]);

  const handleCardClick = (card: PyramidCard) => {
    if (matchState && !revealedCards.has(card.id)) {
      setRevealedCards(prev => new Set([...prev, card.id]));
      
      // Send play card message
      send({
        type: 'PLAY_CARD',
        cardId: card.id
      });
    }
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'S': return '♠';
      default: return suit;
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === 'H' || suit === 'D' ? 'text-red-600' : 'text-black';
  };

  const finishGame = () => {
    navigate(`/results/${code}`);
  };

  if (!matchState) {
    return (
      <div className="centered">
        <h2>Game – Room {code}</h2>
        <p>WebSocket: {connected ? 'connected' : 'connecting...'}</p>
        <p>Loading game state...</p>
      </div>
    );
  }

  const playerIds = Object.keys(matchState.players);
  const currentPlayerId = playerIds[matchState.currentTurn];
  const currentPlayer = matchState.players[currentPlayerId];

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
          <h2 className="text-2xl font-bold text-center">Pyramid Game – Room {code}</h2>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm">WebSocket: {connected ? 'connected' : 'connecting...'}</p>
            <button 
              onClick={finishGame}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              End Game
            </button>
          </div>
        </div>

        {/* Current Turn Display */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Current Turn</h3>
          <div className="flex items-center space-x-4">
            {playerIds.map((playerId, index) => {
              const player = matchState.players[playerId];
              const isCurrentTurn = playerId === currentPlayerId;
              return (
                <div 
                  key={playerId}
                  className={`p-3 rounded-lg border-2 ${
                    isCurrentTurn 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className={`font-medium ${isCurrentTurn ? 'text-blue-600' : 'text-gray-600'}`}>
                    {player.name}
                  </p>
                  <p className="text-sm text-gray-500">Turn {index + 1}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pyramid */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Pyramid</h3>
          <div className="flex flex-col items-center space-y-2">
            {matchState.pyramid?.map((row, rowIndex) => (
              <div 
                key={rowIndex}
                className="flex justify-center space-x-2"
                style={{ 
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {row.map((card, colIndex) => {
                  const isRevealed = revealedCards.has(card.id);
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCardClick(card)}
                      className={`
                        w-16 h-24 rounded-lg border-2 cursor-pointer transition-all duration-300
                        ${isRevealed 
                          ? 'bg-white border-gray-300 hover:shadow-md' 
                          : 'bg-blue-600 border-blue-700 hover:bg-blue-700'
                        }
                        flex items-center justify-center
                      `}
                    >
                      {isRevealed ? (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
                            {card.rank}
                          </div>
                          <div className={`text-sm ${getSuitColor(card.suit)}`}>
                            {getSuitSymbol(card.suit)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-white text-xs text-center">
                          <div>Card</div>
                          <div>Back</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-white rounded-lg p-4 mt-4 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Remaining Cards</p>
              <p className="text-xl font-bold">{matchState.deck.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Discard Pile</p>
              <p className="text-xl font-bold">{matchState.discard.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Players</p>
              <p className="text-xl font-bold">{playerIds.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}