import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface WebSocketContextValue {
  socket?: WebSocket;
  connected: boolean;
  send: (data: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  send: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface Props {
  url?: string;
  children: ReactNode;
}

export function WebSocketProvider({ url, children }: Props) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket>();

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url ?? `ws://${window.location.hostname}:8080`);
      socketRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Attempt reconnection after 1s
        setTimeout(() => connect(), 1000);
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, [url]);

  const send = (data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, connected, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}