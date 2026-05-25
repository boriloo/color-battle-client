import PageRouter from './pages/pageRouter/pageRouter';
import { PlayerProvider } from './context/playerContext';
import { GameProvider } from './context/gameContext';

function App() {
  return (
    <PlayerProvider>
      <GameProvider>
        <PageRouter />
      </GameProvider>
    </PlayerProvider>
  )
}

export default App
