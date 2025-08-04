import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

export default function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { connected } = useWebSocket();

  const finishGame = () => {
    navigate(`/results/${code}`);
  };

  return (
    <div className="centered">
      <h2>Game – Room {code}</h2>
      <p>WebSocket: {connected ? 'connected' : 'connecting...'}</p>
      <p>(Pyramid / Bus phases will be implemented here.)</p>
      <button onClick={finishGame}>End Game</button>
    </div>
  );
}