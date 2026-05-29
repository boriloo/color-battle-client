import PageRouter from './pages/pageRouter/pageRouter';
import { PlayerProvider } from './context/playerContext';
import { GameProvider } from './context/gameContext';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    document.title = "HueMaster";
  }, []);


  return (
    <PlayerProvider>
      <GameProvider>
        <PageRouter />
      </GameProvider>
    </PlayerProvider>
  )
}

export default App
