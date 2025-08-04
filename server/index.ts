import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const server = http.createServer();
const wss = new WebSocketServer({ server });

interface ClientMeta {
  id: string;
  room?: string;
}

const clients = new Map<WebSocket, ClientMeta>();

wss.on('connection', (ws) => {
  const meta: ClientMeta = { id: uuidv4() };
  clients.set(ws, meta);

  ws.on('message', (data) => {
    // Placeholder – future: parse JSON events and route.
    console.log(`[message] ${data}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Ride the Bus WS server running on port ${PORT}`);
});