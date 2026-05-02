import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import StatusBar from './components/StatusBar';

function App() {
  return (
    <div className="app-container">
      <MenuBar />
      <Toolbar />
      <div className="main-content">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default App;
