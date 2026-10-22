import React, { useState } from "react";
import Lobby from "./components/Lobby";
import GameCanvas from "./components/GameCanvas";
import TopHUD from "./components/TopHUD";
import socketService from "./network/socket";

export default function App() {
  const [gameState, setGameState] = useState("lobby"); // "lobby" | "in_game"
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameState("in_game");
  };

  const handleLeaveRoom = () => {
    if (socketService.socket) {
      socketService.socket.disconnect();
    }
    setGameState("lobby");
    setGameConfig(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {gameState === "lobby" ? (
        <Lobby onStartGame={handleStartGame} />
      ) : (
        <>
          {gameConfig?.mode === "coop" && (
            <TopHUD
              roomCode={gameConfig.roomCode}
              isHost={gameConfig.isHost}
              onLeaveRoom={handleLeaveRoom}
            />
          )}
          <GameCanvas
            gameConfig={gameConfig}
            onReturnLobby={handleLeaveRoom}
          />
        </>
      )}
    </div>
  );
}

