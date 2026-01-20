import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import LobbyScreen from './components/LobbyScreen';
import RaceScene from './scenes/RaceScene';
import RaceResults from './components/RaceResults';
import Settings from './components/Settings';

export default function App() {
  const { currentScreen, initializeSocket } = useGameStore();

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'lobby' && <LobbyScreen />}
      {currentScreen === 'race' && <RaceScene />}
      {currentScreen === 'results' && <RaceResults />}
      {currentScreen === 'settings' && <Settings />}
    </div>
  );
}
