import { useParams, Link } from 'react-router-dom';

export default function Results() {
  const { code } = useParams();
  return (
    <div className="centered">
      <h2>Results – Room {code}</h2>
      <p>Show final sips and allow new game.</p>
      <Link to={`/room/${code}`}>Back to Lobby</Link>
    </div>
  );
}