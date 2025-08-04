import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    // In future, request server to create; for now generate local code.
    const newCode = uuidv4().slice(0, 6).toUpperCase();
    navigate(`/room/${newCode}`);
  };

  const joinRoom = () => {
    if (code.trim()) {
      navigate(`/room/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="centered">
      <h1>Ride the Bus</h1>
      <button onClick={createRoom}>Create Room</button>

      <div className="join">
        <input
          type="text"
          value={code}
          placeholder="Room code"
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );
}