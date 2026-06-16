import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { NerdHome } from './NerdHome';
import { MainSite } from './components/MainSite/MainSite';
import { DebugDashboard } from './components/Debug/DebugDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NerdHome />} />
        <Route path="/resume" element={<MainSite />} />
        <Route path="/debug" element={<DebugDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
