import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { connected } = useWebSocket();

  const startGame = () => {
    // placeholder: navigate directly for now
    navigate(`/game/${code}`);
  };

  return (
    <div className="centered">
      <h2>Lobby – Room {code}</h2>
      <p>WebSocket: {connected ? 'connected' : 'connecting...'}</p>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}