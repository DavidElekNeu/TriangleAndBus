import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:code" element={<Lobby />} />
      <Route path="/game/:code" element={<Game />} />
      <Route path="/results/:code" element={<Results />} />
    </Routes>
  );
}